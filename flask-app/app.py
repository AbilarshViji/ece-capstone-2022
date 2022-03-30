from flask import Flask, jsonify,request,send_from_directory,render_template
import os,re,subprocess
from music_generator import generate_midi_melody,generate_noteSequence,to_audio,generate_midi_pitches
from flask_cors import CORS

import logging
logger = logging.getLogger('waitress')
logger.setLevel(logging.INFO)

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
GENERATION_DIR = 'generation'
rnn_model = 'models/8120_nes.mag'
soundfont = 'models/Famicom.sf2'

@app.route('/')
def index():
    return render_template('../Frontend/build/index.html')

@app.route('/uploads/<filename>', methods=['GET', 'POST'])
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)
 
@app.route('/generate_midi', methods=['POST'])
def generate_midi():
    request_data = request.get_json()
    pitches = request_data['pitch']
    #print(pitches[-1])
    durations = request_data['duration']
    noteSequence = generate_noteSequence(pitches, durations)

    midi_file = generate_midi_melody(noteSequence)
    # midi_file = generate_midi_pitches(pitches)
    return midi_file

# Not really an MP3, it's a WAV
@app.route('/get_mp3', methods=['POST'])
def generate_mp3():
    request_data = request.get_json()
    # print(request_data)
    file_name = request_data['file_name']
    print("File name from request", file_name)
    midi_dir = '{}/{}'.format(GENERATION_DIR,file_name)
    mp3_dir = '{}/{}.mp3'.format(UPLOAD_FOLDER,file_name.split('.')[0])
    print("==============midi_dir from format", midi_dir)
    print("==============mp3_dir from format", mp3_dir)

    to_audio(midi_dir,mp3_dir)
    return mp3_dir

def generate_nes_music(call_sid, output_file):
    midi_file_path = generate_midi(call_sid)
    to_audio(midi_file_path, output_file)

if __name__ == '__main__':
    from waitress import serve
    serve(app, host="0.0.0.0", port=5000)