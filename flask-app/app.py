from flask import Flask, jsonify,request,send_from_directory
import os,re,subprocess
from music_generator import generate_midi_melody,generate_noteSequence,to_audio


app = Flask(__name__)


UPLOAD_FOLDER = 'uploads'
GENERATION_DIR = 'generation'
rnn_model = 'models\\8120_nes.mag'
soundfont = 'models\\Famicom.sf2'



@app.route('/')
def index():
    return 'hello world'

@app.route('/test')
def get_current_user():
    return jsonify(username='Ankur Kejriwal',
                   email='memelord@gmail.com',
                   id='4206924069')

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
    return midi_file

@app.route('/get_mp3', methods=['POST'])
def generate_mp3():

    request_data = request.get_json()
    file_name = request_data['file_name']
    midi_dir = '{}\\{}'.format(GENERATION_DIR,file_name)
    mp3_dir = '{}\\{}.mp3'.format(UPLOAD_FOLDER,file_name.split('.')[0])
    
    to_audio(midi_dir,mp3_dir)

    return jsonify(
        mp3_directory = mp3_dir
    )

def generate_nes_music(call_sid, output_file):
    midi_file_path = generate_midi(call_sid)
    to_audio(midi_file_path, output_file)

if __name__ == '__main__':
    app.run(debug=True)