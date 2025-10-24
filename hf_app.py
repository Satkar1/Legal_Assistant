import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import time
import traceback

# Create main app
app = Flask(__name__)
CORS(app, origins=[
    "https://*.vercel.app",
    "https://*.hf.space", 
    "http://localhost:8000",
    "http://localhost:3000"
], methods=["GET", "POST", "PUT", "DELETE"], allow_headers=["*"])

# Store references to your existing apps
fir_app = None
chatbot_app = None

@app.route('/')
def home():
    return jsonify({
        "status": "Legal Assistance API",
        "version": "1.0",
        "services": ["fir", "chatbot", "auth"]
    })

@app.route('/api/health')
def health():
    return jsonify({
        "status": "healthy",
        "timestamp": time.time()
    })

# Import and configure your existing apps
def initialize_services():
    global fir_app, chatbot_app
    
    try:
        # Initialize FIR API - use import inside function to avoid circular imports
        from fir_api import app as fir_app_instance
        fir_app = fir_app_instance
        print("✅ FIR API initialized")
    except Exception as e:
        print(f"❌ FIR API initialization failed: {e}")
        traceback.print_exc()
    
    try:
        # Initialize Chatbot API  
        from chatbot_api import app as chatbot_app_instance
        chatbot_app = chatbot_app_instance
        print("✅ Chatbot API initialized")
    except Exception as e:
        print(f"❌ Chatbot API initialization failed: {e}")
        traceback.print_exc()

# Proxy routes for FIR API
@app.route('/api/fir/<path:path>', methods=['GET', 'POST', 'PUT'])
@app.route('/api/fir/', methods=['GET', 'POST', 'PUT'], defaults={'path': ''})
def fir_proxy(path):
    if fir_app:
        try:
            with fir_app.test_request_context(path=request.path, method=request.method, 
                                            headers=dict(request.headers), data=request.get_data()):
                return fir_app.full_dispatch_request()
        except Exception as e:
            return jsonify({"error": f"FIR service error: {str(e)}"}), 500
    return jsonify({"error": "FIR service unavailable"}), 503

# Proxy routes for Chatbot API
@app.route('/api/chat', methods=['POST'])
@app.route('/api/register', methods=['POST']) 
@app.route('/api/login', methods=['POST'])
@app.route('/api/health/chatbot', methods=['GET'])
def chatbot_proxy():
    if chatbot_app:
        try:
            with chatbot_app.test_request_context(path=request.path, method=request.method,
                                                headers=dict(request.headers), data=request.get_data()):
                return chatbot_app.full_dispatch_request()
        except Exception as e:
            return jsonify({"error": f"Chatbot service error: {str(e)}"}), 500
    return jsonify({"error": "Chatbot service unavailable"}), 503

# Police endpoints proxy
@app.route('/api/police/<path:path>', methods=['GET', 'POST', 'PUT'])
def police_proxy(path):
    if fir_app:
        try:
            with fir_app.test_request_context(path=request.path, method=request.method,
                                            headers=dict(request.headers), data=request.get_data()):
                return fir_app.full_dispatch_request()
        except Exception as e:
            return jsonify({"error": f"Police service error: {str(e)}"}), 500
    return jsonify({"error": "Police service unavailable"}), 503

# Initialize services when app starts
with app.app_context():
    initialize_services()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 7860))
    app.run(host='0.0.0.0', port=port, debug=False)
