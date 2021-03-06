import React, { useState, useMemo, useEffect, useRef } from "react";

import { useBackingTrackContext } from "../../../../hooks";
import { PlaybackAudio } from "../../../audio";
import {
  SimpleButton,
  Timer,
  TimerBox,
  Instructions,
  DynamicContent,
  MediumTitle,
  MediumLargeTitle,
  ComputerButton,
  InlineWidthButton,
} from "../../../common";
import { secToMs } from "../../../../utils";

interface PracticePlaybackViewProps {
  stopSample: Function;
  isSamplePlayerLoaded: boolean;
  recording: any;
  sampleName: string;
  advanceView: Function;
  playerId?: string;
}

const PracticePlaybackView: React.FC<PracticePlaybackViewProps> = ({
  stopSample,
  isSamplePlayerLoaded,
  recording,
  sampleName,
  advanceView,
  playerId = "_",
}) => {
  const [activePlaybackTrack, setActivePlaybackTrack] = useState<string>();

  // auto play
  const [autoPlayingTrackIdx, setAutoPlayingTrackIdx] = useState<number>(-1);
  const autoPlayCounter = useRef(null) as any;

  const { recordingTime } = useBackingTrackContext();

  useEffect(() => {
    if (isSamplePlayerLoaded) {
      if (autoPlayingTrackIdx === -1) {
        setAutoPlayingTrackIdx((idx) => idx + 1);
      }
    }

    if (autoPlayingTrackIdx < 2) {
      autoPlayCounter.current = setTimeout(() => {
        setAutoPlayingTrackIdx((idx) => idx + 1);
      }, secToMs(recordingTime));
    }

    return () => {
      clearTimeout(autoPlayCounter.current);
    };
  }, [autoPlayingTrackIdx, isSamplePlayerLoaded]);

  const autoPlayingId = useMemo(() => {
    return autoPlayingTrackIdx < 1 ? playerId : undefined;
  }, [autoPlayingTrackIdx]);

  return (
    <div className="view_container">
      <MediumLargeTitle>PRACTICE - PLAYBACK</MediumLargeTitle>
      <DynamicContent>
        {!!recording ? (
          <div>
            <PlaybackAudio
              isCurrPlayer={false}
              recording={recording}
              playerId={playerId}
              stopSample={stopSample}
              color={"var(--current_player_color)"}
              submitVote={() => {}}
              setActivePlaybackTrack={setActivePlaybackTrack}
              isPlaying={true}
              listenComplete={true}
              canVote={true}
              completeListening={() => {}}
              emptyRecording={false}
              autoPlayingId={autoPlayingId}
              practiceMode={true}
            />
          </div>
        ) : (
          <div>No recordings available</div>
        )}
        <InlineWidthButton callback={() => advanceView()}>
          <h5>CONTINUE</h5>
        </InlineWidthButton>
      </DynamicContent>
    </div>
  );
};
export { PracticePlaybackView };
