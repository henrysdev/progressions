import React, { useEffect, useState } from "react";

import { SUBMIT_RECORDING_EVENT } from "../../../../../constants";
import { MidiInput } from "../../../../audio";
import { SimpleButton } from "../../../../common";

interface RecordingViewProps {
  isContestant: boolean;
  pushMessageToChannel: Function;
  playSample: Function;
}

const RecordingView: React.FC<RecordingViewProps> = ({
  isContestant,
  pushMessageToChannel,
  playSample,
}) => {
  const [playerRecording, setPlayerRecording] = useState<Object>();

  useEffect(() => {
    playSample();
  }, []);

  return isContestant ? (
    <div>
      <h3>Recording View</h3>
      <MidiInput submitRecording={setPlayerRecording} />
      <h1>Sample Recording View</h1>
      <SimpleButton
        label="Submit Recording"
        callback={() => {
          if (!!playerRecording) {
            pushMessageToChannel(SUBMIT_RECORDING_EVENT, {
              recording: JSON.stringify(playerRecording),
            });
            setPlayerRecording(undefined);
          }
        }}
        disabled={!playerRecording}
      />
    </div>
  ) : (
    <div>WAITING FOR CONTESTANTS TO FINISH RECORDING...</div>
  );
};
export { RecordingView };
