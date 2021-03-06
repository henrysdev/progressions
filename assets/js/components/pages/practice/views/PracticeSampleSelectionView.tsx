import React, { useState, useMemo, useEffect } from "react";

import {
  Timer,
  Instructions,
  MediumLargeTitle,
  MediumTitle,
  DynamicContent,
  TimerBox,
  ComputerButton,
  InlineWidthButton,
  MaterialIcon,
  ArrowButton,
} from "../../../common";
import { randomElement } from "../../../../utils";
import { useToneAudioContext } from "../../../../hooks";
import { WarmUp } from "../../room/pregame";

interface PracticeSampleSelectionViewProps {
  nextSample: Function;
  prevSample: Function;
  stopSample: Function;
  samplePlayer: any;
  advanceView: Function;
  currentSample?: string;
  isSamplePlayerLoaded: boolean;
}

const PracticeSampleSelectionView: React.FC<PracticeSampleSelectionViewProps> = ({
  stopSample,
  samplePlayer,
  nextSample,
  prevSample,
  currentSample,
  advanceView,
  isSamplePlayerLoaded,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    samplePlayer.loop = true;
  }, []);

  const stopSamplePreview = () => {
    stopSample();
    setIsPlaying(false);
  };

  const startSamplePreview = () => {
    samplePlayer.loop = true;
    samplePlayer.start();
    setIsPlaying(true);
  };

  const togglePlaySample = () => {
    stopSamplePreview();
    if (isPlaying) {
      stopSamplePreview();
    } else {
      startSamplePreview();
    }
  };

  return (
    <div className="view_container">
      <MediumLargeTitle>PRACTICE - SAMPLE SELECTION</MediumLargeTitle>
      <DynamicContent>
        {!!currentSample ? (
          <div className="selected_sample_anchor">
            <div style={{ display: "flex" }}>
              <div style={{ flex: 1, float: "right", textAlign: "right" }}>
                <ArrowButton
                  callback={() => {
                    stopSamplePreview();
                    prevSample();
                  }}
                  left={true}
                />
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ textAlign: "center" }}>{currentSample}</h2>
              </div>
              <div style={{ flex: 1, float: "left", textAlign: "left" }}>
                <ArrowButton
                  callback={() => {
                    stopSamplePreview();
                    nextSample();
                  }}
                  left={false}
                />
              </div>
            </div>
            <div
              className="selected_sample_play_button relative_anchor"
              onClick={
                isSamplePlayerLoaded
                  ? togglePlaySample
                  : () => console.log("sample has not loaded yet")
              }
            >
              <div className="selected_sample_play_button_icon">
                {isPlaying ? (
                  <MaterialIcon
                    iconName="stop_circle"
                    style={{
                      textAlign: "center",
                      fontSize: "100px",
                    }}
                  />
                ) : (
                  <MaterialIcon
                    iconName="play_circle"
                    style={{
                      textAlign: "center",
                      fontSize: "100px",
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        ) : (
          <></>
        )}
        <WarmUp />
        <InlineWidthButton
          callback={() => {
            stopSamplePreview();
            advanceView();
          }}
        >
          <h5>PRACTICE ROUND</h5>
        </InlineWidthButton>
      </DynamicContent>
    </div>
  );
};
export { PracticeSampleSelectionView };
