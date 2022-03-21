import React from "react";
import ReactDOM from "react-dom";
import _ from "lodash";
import { Piano, KeyboardShortcuts, MidiNumbers } from "react-piano";
import "react-piano/dist/styles.css";

import DimensionsProvider from "./DimensionsProvider";
import SoundfontProvider from "./SoundfontProvider";
import PianoWithRecording from "./PianoWithRecording";
import "./style.css";
import { array } from "prop-types";

// webkitAudioContext fallback needed to support Safari
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const soundfontHostname = "https://d1pzp51pvbm36p.cloudfront.net";
const backendIP = "http://localhost:5000/";

var noteRange = {
  first: MidiNumbers.fromNote("c3"),
  last: MidiNumbers.fromNote("f4"),
};

var keyboardShortcuts = KeyboardShortcuts.create({
  firstNote: noteRange.first,
  lastNote: noteRange.last,
  keyboardConfig: KeyboardShortcuts.HOME_ROW,
});

function App() {
  return (
    <div>
      <div class="logo">
        <center>
          <img src="https://i.ibb.co/pnNq9cX/Untitled-1.jpg"></img>
        </center>
      </div>

      <div style={{ padding: 70 }}>
        <ResponsivePiano />
      </div>
    </div>
  );
}

class ResponsivePiano extends React.Component {
  state = {
    recording: {
      mode: "RECORDING",
      events: [],
      currentTime: 0,
      currentEvents: [],
    },
  };

  constructor(props) {
    super(props);

    this.scheduledEvents = [];
  }

  getRecordingEndTime = () => {
    if (this.state.recording.events.length === 0) {
      return 0;
    }
    return Math.max(
      ...this.state.recording.events.map((event) => event.time + event.duration)
    );
  };

  setRecording = (value) => {
    this.setState({
      recording: Object.assign({}, this.state.recording, value),
    });
  };

  onClickPlay = () => {
    this.setRecording({
      mode: "PLAYING",
    });
    const startAndEndTimes = _.uniq(
      _.flatMap(this.state.recording.events, (event) => [
        event.time,
        event.time + event.duration,
      ])
    );
    startAndEndTimes.forEach((time) => {
      this.scheduledEvents.push(
        setTimeout(() => {
          const currentEvents = this.state.recording.events.filter((event) => {
            return event.time <= time && event.time + event.duration > time;
          });
          this.setRecording({
            currentEvents,
          });
        }, time * 1000)
      );
    });
    // Stop at the end
    setTimeout(() => {
      this.onClickStop();
    }, this.getRecordingEndTime() * 1000);
  };

  onClickStop = () => {
    this.scheduledEvents.forEach((scheduledEvent) => {
      clearTimeout(scheduledEvent);
    });
    this.setRecording({
      mode: "RECORDING",
      currentEvents: [],
    });
  };

  onClickClear = () => {
    this.onClickStop();
    this.setRecording({
      events: [],
      mode: "RECORDING",
      currentEvents: [],
      currentTime: 0,
    });
  };

  onClickChange = () => {
    this.noteRange = {
      first: MidiNumbers.fromNote("c3"),
      last: MidiNumbers.fromNote("f5"),
    };

    this.keyboardShortcuts = KeyboardShortcuts.create({
      firstNote: noteRange.first,
      lastNote: noteRange.last,
      keyboardConfig: KeyboardShortcuts.HOME_ROW,
    });
  };

  onClickML = async () => {
    let durations = this.state.recording.events.map((a) => a.duration);
    let pitches = this.state.recording.events.map((a) => a.midiNumber);

    let dataToSend = {
      pitch: pitches,
      duration: durations,
    };

    let res = await fetch(backendIP+"generate_midi", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataToSend),
    });

    let midiFileName = await res.text();

    let mp3FileNamePromise = await fetch(backendIP+"get_mp3", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ file_name: midiFileName }),
    });

    let mp3FileName = await mp3FileNamePromise.text();

    let player = document.getElementById("audio-player");
    player.style.display="block";
    player.src = backendIP+`${mp3FileName}`;
  
    this.setRecording({
      events: [],
      mode: "RECORDING",
      currentEvents: [],
      currentTime: 0,
    });
  };

  render() {
    return (
      <DimensionsProvider>
        {({ containerWidth, containerHeight }) => (
          <div>
            <div className="mt-5">
              <SoundfontProvider
                instrumentName="acoustic_grand_piano"
                audioContext={audioContext}
                hostname={soundfontHostname}
                render={({ isLoading, playNote, stopNote }) => (
                  <PianoWithRecording
                    recording={this.state.recording}
                    setRecording={this.setRecording}
                    noteRange={noteRange}
                    width={containerWidth}
                    playNote={playNote}
                    stopNote={stopNote}
                    disabled={isLoading}
                    keyboardShortcuts={keyboardShortcuts}
                  />
                )}
              />
            </div>
            <div className="buttonBody">
              {/* <button onClick={this.onClickPlay}>Play</button>
              <button onClick={this.onClickStop}>Stop</button>
              <button onClick={this.onClickClear}>Clear</button>
              <button onClick={this.onClickChange}>Change</button> */}
              <button onClick={this.onClickML}>Generate</button>
            </div>
            <center>
              <audio style={{marginBottom:'50px', display:'none'}} id="audio-player" controls src="">
                Your browser does not support the
                <code>audio</code> element.
              </audio>
            </center>
            {/* <div className="mt-5">
              <strong>Recorded notes</strong>
              <div>{JSON.stringify(this.state.recording.events)}</div>
            </div> */}
          </div>
        )}
      </DimensionsProvider>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
