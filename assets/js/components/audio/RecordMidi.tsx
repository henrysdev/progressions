import _ from "lodash";
import React, { useEffect, useState, useMemo } from "react";
import { Input } from "webmidi";

import { Keyboard } from ".";
import { MIDINoteEvent, GameRules, Milliseconds } from "../../types";
import {
  useToneAudioContext,
  useNoteRecorder,
  useKeyboardInputContext,
} from "../../hooks";
import * as Tone from "tone";
import { ArrowButton } from "../common";
import { MIN_C_OCTAVE, MIDDLE_C_OCTAVE, MAX_C_OCTAVE } from "../../constants";
import { MidiNumbers, KeyboardShortcuts } from "../reactpiano";

interface RecordMidiProps {
  submitRecording: Function;
  sampleStartPlayCallback: Function;
  stopSample: Function;
  setIsRecording: Function;
  roundRecordingStartTime: Milliseconds;
  gameRules: GameRules;
  shouldRecord: boolean;
  hideKeyboard?: boolean;
  isRecording: boolean;
}

const RecordMidi: React.FC<RecordMidiProps> = ({
  submitRecording,
  sampleStartPlayCallback,
  stopSample,
  setIsRecording,
  roundRecordingStartTime,
  gameRules,
  shouldRecord,
  hideKeyboard = false,
  isRecording,
}) => {
  const { midiInputs, synth } = useToneAudioContext();
  const { disableKeyboardInput } = useKeyboardInputContext();

  const {
    activeMidiList,
    handleNoteOn,
    handleNoteOff,
    playRecordedNote,
    stopRecordedNote,
  } = useNoteRecorder({
    submitRecording,
    sampleStartPlayCallback,
    setIsRecording,
    roundRecordingStartTime,
    gameRules,
    shouldRecord,
  });

  // init on load
  useEffect(() => {
    Tone.start();
    return () => {
      stopSample();
      [...Array(200).keys()].forEach((midiNumber) => {
        const noteName = noteNumberToNoteName(midiNumber);
        synth.triggerRelease(noteName);
      });
    };
  }, []);

  // init midi event listeners on initial render
  useEffect(() => {
    midiInputs.forEach((input: Input) => {
      input.addListener("noteon", "all", (event) => handleNoteOn(event));
      input.addListener("noteoff", "all", (event) => handleNoteOff(event));
    });
    return () => {
      midiInputs.forEach((input: Input) => {
        input.removeListener("noteon", "all");
        input.removeListener("noteoff", "all");
      });
    };
  }, [midiInputs]);

  const [currOctave, setCurrOctave] = useState<number>(MIDDLE_C_OCTAVE);

  // TODO must stop midi notes as well
  const stopAllActiveNotes = () => {
    for (var i = 0; i <= 112; i++) {
      stopNote(i);
    }
  };

  const decrOctave = () => {
    stopAllActiveNotes();
    setCurrOctave((prev) => (prev > MIN_C_OCTAVE ? prev - 1 : prev));
  };
  const incrOctave = () => {
    stopAllActiveNotes();
    setCurrOctave((prev) => (prev < MAX_C_OCTAVE ? prev + 1 : prev));
  };

  const keyboardShortcuts = useMemo(() => {
    return KeyboardShortcuts.create({
      firstNote: MidiNumbers.fromNote(`c${currOctave}`),
      lastNote: MidiNumbers.fromNote(`c${currOctave + 2}`),
      keyboardConfig: KeyboardShortcuts.HOME_ROW,
    });
  }, [currOctave]);

  const stopNote = (midiNumber: number) => {
    if (!!synth) {
      const { noteNumber } = stopRecordedNote(midiNumber);
      const noteName = noteNumberToNoteName(noteNumber);
      synth.triggerRelease(noteName);
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "8px",
        }}
      >
        <ArrowButton
          left={true}
          callback={() => decrOctave()}
          hidden={
            disableKeyboardInput || hideKeyboard || currOctave === MIN_C_OCTAVE
          }
          styles={{ color: "yellow" }}
        />
        <div
          style={{
            display: "inline-block",
            width: "100%",
            height: 120,
          }}
        >
          <Keyboard
            activeMidiList={activeMidiList}
            playNote={(midiNumber: number) => {
              if (!!synth) {
                const { noteNumber, noteVelocity } = playRecordedNote(
                  midiNumber
                );
                const noteName = noteNumberToNoteName(noteNumber);
                synth.triggerAttack(noteName, "+0", noteVelocity);
              }
            }}
            stopNote={stopNote}
            hideKeyboard={hideKeyboard}
            disableKeyboardInput={disableKeyboardInput}
            isRecording={isRecording}
            keyboardShortcuts={keyboardShortcuts}
          />
        </div>
        <ArrowButton
          left={false}
          callback={() => incrOctave()}
          hidden={
            disableKeyboardInput || hideKeyboard || currOctave === MAX_C_OCTAVE
          }
          styles={{ color: "yellow" }}
        />
      </div>
    </div>
  );
};
export { RecordMidi };

function noteNumberToNoteName(midiNoteId: number): string {
  const octave = Math.floor(midiNoteId / 12) - 1;
  const offset = (midiNoteId % 12) * 2;
  const note = "C C#D D#E F F#G G#A A#B ".substring(offset, offset + 2).trim();
  return `${note}${octave}`;
}
