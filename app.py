import os
import pyttsx3
from flask import Flask, request, render_template, send_file, jsonify, abort
from PyPDF2 import PdfReader
from docx import Document
from lessons import get_lesson

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'

# Ensure the upload folder exists
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])


# Function to extract text from files
def extract_text_from_file(file_path, file_type):
    text = ""
    try:
        if file_type == 'txt':
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
        elif file_type == 'pdf':
            reader = PdfReader(file_path)
            for page in reader.pages:
                text += page.extract_text() or ""
        elif file_type == 'docx':
            doc = Document(file_path)
            for para in doc.paragraphs:
                text += para.text
    except Exception as e:
        print(f"Error extracting text: {e}")
    return text

# Function to convert text to speech using pyttsx3 and save it to an audio file
def speak_text_to_file(text, audio_file, voice_id=None):
    engine = pyttsx3.init()
    voices = engine.getProperty('voices')

    # If no voice_id is provided, use the first available voice
    if voice_id:
        found_voice = next((voice for voice in voices if voice.id == voice_id), None)
        if found_voice:
            engine.setProperty('voice', voice_id)
        else:
            print(f"Voice ID {voice_id} not found. Using default voice.")
            engine.setProperty('voice', voices[0].id)  # Fallback to the first voice

    engine.save_to_file(text, audio_file)
    engine.runAndWait()

# Route for the home page
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/LandingPage')
def landingpage():
    return render_template('index2.html')

@app.route('/profile')
def profile():
    return render_template('profile.html')

# Route for convert  (Text-to-Speech)
@app.route('/convert')
def convert():
    return render_template('convert.html')

@app.route('/book')
def book():
    return render_template('book.html')

@app.route('/lesson/<chapter>')
def lesson(chapter):
    lesson_data = get_lesson(chapter)  # Use the function to fetch lesson content
    if lesson_data:
        return render_template('lesson.html', title=lesson_data['title'], content=lesson_data['content'])
    return "Chapter not found", 404

# Get available voices (for selection on frontend)
@app.route('/get_voices', methods=['GET'])
def get_voices():
    engine = pyttsx3.init()
    voices = engine.getProperty('voices')
    voices_list = [{'id': voice.id, 'name': voice.name} for voice in voices]
    return jsonify(voices_list)

# Route for file upload and TTS conversion
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files or 'voice_id' not in request.form:
        return jsonify({"error": "File or voice selection not provided"}), 400

    file = request.files['file']
    voice_id = request.form['voice_id']

    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    # File extension check
    file_ext = file.filename.rsplit('.', 1)[1].lower()
    if file_ext not in ['txt', 'pdf', 'docx']:
        return jsonify({"error": "Unsupported file type"}), 400

    # Sanitize filename to prevent directory traversal or overwriting
    safe_filename = os.path.basename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], safe_filename)
    file.save(file_path)

    # Extract text from the uploaded file
    text = extract_text_from_file(file_path, file_ext)

    if not text:
        return jsonify({"error": "Failed to extract text from the file"}), 500

    # Convert text to speech and save as an audio file
    audio_file = os.path.join(app.config['UPLOAD_FOLDER'], 'output.mp3')
    speak_text_to_file(text, audio_file, voice_id)

    # Return both the text and audio file URL
    return jsonify({"text": text, "audio_url": '/download_audio'}), 200

@app.route('/download_audio', methods=['GET'])
def download_audio():
    audio_file = os.path.join(app.config['UPLOAD_FOLDER'], 'output.mp3')
    if os.path.exists(audio_file):
        return send_file(audio_file, as_attachment=True, mimetype='audio/mpeg')
    return abort(404)

@app.route('/read_text_aloud', methods=['POST'])
def read_text_aloud():
    data = request.json
    text = data.get('text')
    voice_id = data.get('voice_id')

    if not text:
        return jsonify({"error": "No text provided"}), 400

    audio_file = os.path.join(app.config['UPLOAD_FOLDER'], 'text_output.mp3')
    speak_text_to_file(text, audio_file, voice_id)

    return send_file(audio_file, as_attachment=True, mimetype='audio/mpeg')

# Route for converting paragraph text to speech and playing it (with voice selection)
@app.route('/read_paragraph', methods=['POST'])
def read_paragraph():
    data = request.json
    text = data.get('text')
    voice_id = data.get('voice_id')

    if not text:
        return "No text provided", 400

    audio_file = os.path.join(app.config['UPLOAD_FOLDER'], 'paragraph_output.mp3')
    speak_text_to_file(text, audio_file, voice_id)

    return send_file(audio_file, as_attachment=True, mimetype='audio/mpeg')


if __name__ == '__main__':
    app.run(debug=True)
