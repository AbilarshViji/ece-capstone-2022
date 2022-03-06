import React from "react";
import { Piano } from "react-piano";

const DURATION_UNIT = 0.2;
const DEFAULT_NOTE_DURATION = DURATION_UNIT;

class PianoWithRecording extends React.Component {
  static defaultProps = {
    notesRecorded: false,
    startTime: 0
  };

  state = {
    keysDown: {},
    noteDuration: DEFAULT_NOTE_DURATION,
    playing: false
  };

  onPlayNoteInput = (midiNumber) => {
    if (this.state.playing) return;
    var d = new Date();
    this.setState({
      notesRecorded: false,
      startTime: d.getTime(),
      playing: true
    });
    console.log("startTime", this.state.startTime);
  };

  onStopNoteInput = (midiNumber, { prevActiveNotes }) => {
    if (this.state.playing === false) return;
    var d = new Date();
    console.log("endTime", d.getTime());
    console.log("diff", d.getTime() - this.state.startTime);

    if (this.state.notesRecorded === false) {
      this.setState({
        noteDuration: (d.getTime() - this.state.startTime) / 1000,
        playing: false,
        notesRecorded: true
      });
      this.recordNotes(prevActiveNotes, this.state.noteDuration);
    }
  };

  recordNotes = (midiNumbers, duration) => {
    if (this.props.recording.mode !== "RECORDING") {
      return;
    }
    const newEvents = midiNumbers.map((midiNumber) => {
      return {
        midiNumber,
        time: this.props.recording.currentTime,
        duration: duration
      };
    });
    this.props.setRecording({
      events: this.props.recording.events.concat(newEvents),
      currentTime: this.props.recording.currentTime + duration
    });
  };

  render() {
    const {
      playNote,
      stopNote,
      recording,
      setRecording,
      ...pianoProps
    } = this.props;

    const { mode, currentEvents } = this.props.recording;
    const activeNotes =
      mode === "PLAYING"
        ? currentEvents.map((event) => event.midiNumber)
        : null;
    return (
      <div>
        <Piano
          playNote={this.props.playNote}
          stopNote={this.props.stopNote}
          onPlayNoteInput={this.onPlayNoteInput}
          onStopNoteInput={this.onStopNoteInput}
          activeNotes={activeNotes}
          {...pianoProps}
        />
      </div>
    );
  }
}

export default PianoWithRecording;
