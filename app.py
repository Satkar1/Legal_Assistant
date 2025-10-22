# app.py
from flask import Flask, send_from_directory
from flask_cors import CORS
import os

# Import your existing API blueprints
from fir_api import app as fir_app
from chatbot_api import app as chatbot_app

app = Flask(__name__, static_folder=".", template_folder=".")
CORS(app)

# Mount your two APIs under different prefixes
app.register_blueprint(fir_app, url_prefix="/api/police")
app.register_blueprint(chatbot_app, url_prefix="/api/chatbot")

# Serve your frontend (home.html, etc.)
@app.route('/')
def home():
    return send_from_directory('.', 'home.html')

# Serve any static files (js, css, images)
@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('.', filename)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    app.run(host="0.0.0.0", port=port)
