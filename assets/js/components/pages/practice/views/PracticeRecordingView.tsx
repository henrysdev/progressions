import React, { useState, useMemo } from "react";

import {
  SUBMIT_RECORDING_EVENT,
  DEFAULT_SAMPLE_LENGTH,
  DEFAULT_RECORDING_LENGTH,
  DEFAULT_WARMUP_LENGTH,
} from "../../../../constants";
import { RecordMidi } from "../../../audio";
import {
  Timer,
  Instructions,
  MediumLargeTitle,
  MediumTitle,
  DynamicContent,
  TimerBox,
} from "../../../common";
import { secToMs, unmarshalBody } from "../../../../utils";
import { useGameContext, useClockOffsetContext } from "../../../../hooks";

enum RecordingState {
  INIT,
  WARMUP,
  RECORDING,
  DONE,
}

interface PracticeRecordingViewProps {
  setRecordingCallback: Function;
  stopSample: Function;
  advanceView: Function;
  sampleName: string;
}

const PracticeRecordingView: React.FC<PracticeRecordingViewProps> = ({
  setRecordingCallback,
  stopSample,
  advanceView,
  sampleName,
}) => {
  const [isSamplePlaying, setIsSamplePlaying] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isFinishedRecording, setFinishedRecording] = useState<boolean>(false);

  const submitRecording = (recording: any) => {
    if (!!recording) {
      setRecordingCallback(unmarshalBody(recording));
      setFinishedRecording(true);
      advanceView();
    }
  };

  const sampleStartPlayCallbackWrapper = () => {
    setIsSamplePlaying(true);
  };

  const { gameRules, roundRecordingStartTime } = useGameContext();
  const { clockOffset } = useClockOffsetContext();

  const recordingState: RecordingState = useMemo(() => {
    if (isSamplePlaying && !isRecording && !isFinishedRecording) {
      return RecordingState.WARMUP;
    } else if (isSamplePlaying && isRecording && !isFinishedRecording) {
      return RecordingState.RECORDING;
    } else if (isFinishedRecording) {
      return RecordingState.DONE;
    } else {
      return RecordingState.INIT;
    }
  }, [isSamplePlaying, isRecording, isFinishedRecording]);

  return (
    <div
      className={isRecording ? "view_container neon_border" : "view_container "}
    >
      <span className="anim_line" />
      <span className="anim_line" />
      <span className="anim_line" />
      <span className="anim_line" />
      <MediumLargeTitle>PRACTICE - RECORDING</MediumLargeTitle>
      <MediumTitle>{sampleName}</MediumTitle>
      <DynamicContent>
        {recordingState === RecordingState.INIT ? (
          <Instructions description="Loading sample..." />
        ) : recordingState === RecordingState.WARMUP ? (
          <Instructions description="Listen to the sample and get ready to record!" />
        ) : recordingState === RecordingState.RECORDING ? (
          <Instructions description="Recording in progress... keep playing!" />
        ) : (
          <Instructions
            description="Recording submitted. Waiting for other players to finish
            recording..."
          />
        )}

        {!!roundRecordingStartTime ? (
          <RecordMidi
            hideKeyboard={recordingState === RecordingState.INIT}
            submitRecording={submitRecording}
            sampleStartPlayCallback={sampleStartPlayCallbackWrapper}
            stopSample={stopSample}
            setIsRecording={setIsRecording}
            gameRules={gameRules}
            roundRecordingStartTime={roundRecordingStartTime}
            shouldRecord={true}
            isRecording={isRecording}
          />
        ) : (
          <></>
        )}
      </DynamicContent>
      <TimerBox>
        {recordingState === RecordingState.INIT ? (
          <></>
        ) : recordingState === RecordingState.WARMUP ? (
          <Timer
            descriptionText={"Recording starts in "}
            duration={secToMs(DEFAULT_WARMUP_LENGTH)}
          />
        ) : recordingState === RecordingState.RECORDING ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <i
              style={{ verticalAlign: "middle", color: "red" }}
              className="material-icons"
            >
              radio_button_checked
            </i>
            <Timer
              descriptionText={"Recording ends in "}
              duration={secToMs(DEFAULT_RECORDING_LENGTH)}
              style={{ color: "red" }}
            />
          </div>
        ) : (
          <></>
        )}
      </TimerBox>
    </div>
  );
};
export { PracticeRecordingView };
