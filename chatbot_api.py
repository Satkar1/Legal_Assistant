# chatbot_api.py (Auto-detect Gemini models + hybrid RAG)
from flask import Flask, request, jsonify
from flask_cors import CORS
import os, time, traceback
from dotenv import load_dotenv
from supabase import create_client, Client
load_dotenv()


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)



app = Flask(__name__)
CORS(app)





# ===================== AUTH ENDPOINTS (from app.py) =====================
@app.route('/api/register', methods=['POST'])
def register_user():
    data = request.get_json()
    print("📩 Received registration data:", data)  # optional debug log

    # ✅ Accept both camelCase (frontend) and snake_case (backend)
    full_name = data.get('full_name') or data.get('fullName')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'citizen').lower()  # default to citizen if missing

    # ✅ Validate only required fields
    if not full_name or not email or not password:
        return jsonify({'error': 'Missing required fields'}), 400

    # ✅ Check if user already exists
    existing_user = supabase.table("users").select("email").eq("email", email).execute()
    if existing_user.data:
        return jsonify({'error': 'Email already registered'}), 400

    # ✅ Extract police-specific fields (accept both styles)
    badge_number = data.get('badge_number') or data.get('badgeNumber')
    police_station = data.get('police_station') or data.get('policeStation')
    rank = data.get('rank')

    # ✅ Role-based logic
    if role == 'citizen':
        is_verified = True  # citizen auto-verified
        badge_number = None
        police_station = None
        rank = None
    else:  # police
        is_verified = False  # pending admin verification

    # ✅ Insert into Supabase
    try:
        response = supabase.table("users").insert({
            "full_name": full_name,
            "email": email,
            "password": password,  # consider bcrypt later
            "role": role,
            "is_verified": is_verified,
            "badge_number": badge_number,
            "police_station": police_station,
            "rank": rank
        }).execute()

        if response.data:
            msg = "User registered successfully."
            if role == "police":
                msg += " Awaiting verification by admin."
            return jsonify({"message": msg}), 200
        else:
            return jsonify({"error": "Registration failed"}), 500

    except Exception as e:
        print("❌ Registration error:", e)
        return jsonify({"error": str(e)}), 500




@app.route('/api/login', methods=['POST'])
def login_user():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'citizen').lower()  # ✅ role now included

    if not email or not password or not role:
        return jsonify({'error': 'Missing email, password, or role'}), 400

    try:
        # ✅ Look for user with matching email + role
        user_response = supabase.table("users") \
            .select("*") \
            .eq("email", email) \
            .eq("role", role) \
            .execute()

        if not user_response.data:
            # No matching record for this email+role
            return jsonify({'error': 'Incorrect credentials or role mismatch'}), 401

        user = user_response.data[0]

        # ✅ Password check (plain for now; use bcrypt later)
        if user['password'] != password:
            return jsonify({'error': 'Incorrect credentials'}), 401

        # ✅ Police verification check
        if user['role'] == 'police' and not user.get('is_verified', False):
            return jsonify({'error': 'Police account not verified yet'}), 403

        # ✅ Success → return redirect URL based on role
        redirect_url = (
            '/citizen-dashboard.html'
            if user['role'] == 'citizen'
            else '/police-dashboard.html'
        )

        return jsonify({
            'message': 'Login successful',
            'role': user['role'],
            'redirect': redirect_url,
            'user': {
                'id': user['id'],
                'full_name': user['full_name'],
                'email': user['email'],
                'role': user['role']
            }
        }), 200

    except Exception as e:
        print("❌ Login error:", e)
        return jsonify({'error': f'Server error: {str(e)}'}), 500

# =======================================================================










# --- Load RAG ---
answer_query = None
try:
    from scripts.query import answer_query
    print("✅ RAG system loaded successfully.")
except Exception as e:
    print("⚠️ Could not import RAG system:", e)
    answer_query = None


# --- Configure Gemini ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai = None
gemini_available = False
detected_model = None

if GEMINI_API_KEY:
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        gemini_available = True
        print("✅ Gemini (Google Generative AI) configured.")

        # Dynamically detect any working model
                # Force a specific model for stability
        detected_model = "models/gemini-2.5-flash"
        print(f"✅ Using fixed Gemini model: {detected_model}")

        

    except Exception as e:
        print("⚠️ Failed to configure Gemini client:", e)
else:
    print("⚠️ GEMINI_API_KEY not set.")


# --- Helper: check if RAG output looks valid ---
def is_rag_answer_valid(txt: str):
    if not txt or not isinstance(txt, str):
        return False
    s = txt.strip().lower()
    if len(s) < 30:
        return False
    bad = ["no relevant", "not found", "no data", "sorry", "error", "unknown"]
    return not any(b in s for b in bad)


# --- Gemini call ---
def call_gemini_for_legal_check_and_answer(user_query: str):
    if not gemini_available:
        return None

    prompt = f"""
You are a legal AI assistant for Indian police and legal professionals.

1️⃣ If the user's question is related to **law, legal procedure, IPC sections, evidence, FIR, bail, or court process**, 
then answer factually and concisely, referencing relevant IPC sections or legal procedures.

2️⃣ If the user's question is **not legal** (general chit-chat, emotional, non-law topic), 
reply EXACTLY with this token: NOT_A_LEGAL_QUERY

User question: "{user_query}"
    """.strip()

    try:
        model = genai.GenerativeModel(detected_model)
        resp = model.generate_content([{"role": "user", "parts": [prompt]}])

        text = None
        if hasattr(resp, "text"):
            text = resp.text
        elif hasattr(resp, "candidates") and resp.candidates:
            text = resp.candidates[0].content.parts[0].text
        else:
            text = str(resp)

        return (text or "").strip()
    except Exception as e:
        print("⚠️ Gemini error:", e)
        traceback.print_exc()
        return None


# --- API endpoint ---
@app.route("/api/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json(force=True, silent=True) or {}
        msg = (data.get("message") or "").strip()
        if not msg:
            return jsonify({"success": False, "error": "Empty message"}), 400

        print(f"📨 Query: {msg}")

        # Step 1: RAG
        rag_ans = None
        if answer_query:
            try:
                t0 = time.time()
                rag_ans = answer_query(msg)
                print(f"⏱ RAG took {time.time()-t0:.2f}s")
            except Exception as e:
                print("❌ RAG error:", e)

        if is_rag_answer_valid(rag_ans):
            return jsonify({"success": True, "response": rag_ans, "source": "rag"})

        # Step 2: Gemini
        gem_ans = call_gemini_for_legal_check_and_answer(msg)
        if not gem_ans:
            return jsonify({"success": False, "response": "⚠️ Gemini failed to respond"}), 500

        if "NOT_A_LEGAL_QUERY" in gem_ans:
            return jsonify({
                "success": True,
                "response": "⚖️ Please ask a legal question (IPC, procedure, FIR, bail, etc.).",
                "source": "gemini_filter"
            })

        return jsonify({"success": True, "response": gem_ans, "source": "gemini"})

    except Exception as e:
        print("💥 Chat error:", e)
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "rag_loaded": bool(answer_query),
        "gemini_configured": gemini_available,
        "model": detected_model
    })


if __name__ == "__main__":
    print("🚀 Starting Legal Chatbot API (Hybrid RAG + Gemini with Auto-detect)...")
    app.run(host="0.0.0.0", port=5000, debug=True)
