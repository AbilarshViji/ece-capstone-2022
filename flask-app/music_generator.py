import os, re, subprocess, glob


UPLOAD_FOLDER = 'uploads'
GENERATION_DIR = 'generation'
rnn_model = 'models/8120_nes.mag'
soundfont = 'models/Famicom.sf2'

bpm = 120 #default tempo of model is 120 bpm
bps = bpm/60
div = (1/4)/bps #each division is a sixteenth not, i.e. 1/4 of a quarter note

def generate_noteSequence(pitches, durations):
    noteSequence  = ''

    #TODO Error Handling to ensure the length of pitches is the same length as the duration array
    for i in range(0,len(pitches)):
        # print(i)
        pitch = pitches[i]
        duration = durations[i]
        noteSequence = noteSequence + str(pitch)
        temp = 0
        while(temp<duration):
            noteSequence = noteSequence + ",-2"
            temp = temp + div

        noteSequence = noteSequence + ','

    noteSequence = noteSequence[0:len(noteSequence)-1]
    return noteSequence

def generate_midi_melody(melody_sequence):
    output_dir = GENERATION_DIR
    args = ['polyphony_rnn_generate',
            '--bundle_file', rnn_model,
            '--output_dir', output_dir,
            '--num_outputs', '1',
            '--num_steps', '256',
            '--condition_on_primer','false',
            '--primer_melody', ('['+melody_sequence+']'),
            '--inject_primer_during_generation','true',
            '--log', 'FATAL']
    subprocess.call(args)
    list_of_files = glob.glob(output_dir + '/*.mid')
    return max(list_of_files, key=os.path.getctime)

def generate_midi_pitches(pitch_sequence):
    output_dir = GENERATION_DIR
    args = ['polyphony_rnn_generate',
            '--bundle_file', rnn_model,
            '--output_dir', output_dir,
            '--num_outputs', '1',
            '--num_steps', '256',
            '--condition_on_primer','false',
            '--primer_pitches', ('['+str(pitch_sequence)[1:-1]+']')]
    subprocess.call(args)
    list_of_files = glob.glob(output_dir + '/*.mid')
    return max(list_of_files, key=os.path.getctime)

def to_audio(midi_file, output_file):
    print(os.getcwd())
    subprocess.call(['fluidsynth', '-T', 'wav', '-F',
                    output_file, '-ni', soundfont, midi_file])
    