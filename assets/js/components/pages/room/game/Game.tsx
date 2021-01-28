import { Channel } from "phoenix";
import React, { useEffect, useState } from "react";

import {
  GAME_VIEW,
  VIEW_UPDATE_EVENT,
  SAMPLE_URLS,
} from "../../../../constants";
import { GameContext } from "../../../../contexts";
import {
  GameContextType,
  ViewUpdatePayload,
  SamplePlayer,
} from "../../../../types";
import { gameViewAtomToEnum, unmarshalBody } from "../../../../utils";
import { ClientDebug } from "../../../debug";
import {
  GameEndView,
  GameStartView,
  PlaybackVotingView,
  RecordingView,
  RoundEndView,
  RoundStartView,
} from "./views";
import {
  useGameServerState,
  useSamplePlayer,
  useToneAudioContext,
} from "../../../../hooks";
import { GameLayout } from "./GameLayout";

interface GameProps {
  gameChannel: Channel;
  currMusicianId: string;
}

const Game: React.FC<GameProps> = ({ gameChannel, currMusicianId }) => {
  const [currentView, gameContext, pushMessage] = useGameServerState(
    gameChannel
  );
  console.log("GAME CONTEXT ", gameContext);
  const { Tone } = useToneAudioContext();
  const [loadSample, playSample, stopSample] = useSamplePlayer(Tone);

  const resetTone = () => {
    stopSample();
    Tone.Transport.cancel(0);
    Tone.Transport.stop();
  };

  useEffect(() => {
    switch (currentView) {
      case GAME_VIEW.GAME_START:
        break;
      case GAME_VIEW.ROUND_START:
        // TODO random choice [?]
        loadSample(SAMPLE_URLS[0]);
        break;
      case GAME_VIEW.RECORDING:
        break;
      case GAME_VIEW.PLAYBACK_VOTING:
        resetTone();
        break;
      case GAME_VIEW.ROUND_END:
        resetTone();
        break;
      case GAME_VIEW.GAME_END:
        resetTone();
        break;
    }
  }, [currentView]);

  return (
    <GameContext.Provider value={gameContext} key={currentView}>
      <GameLayout>
        {(() => {
          switch (currentView) {
            case GAME_VIEW.GAME_START:
              return <GameStartView pushMessageToChannel={pushMessage} />;

            case GAME_VIEW.ROUND_START:
              return <RoundStartView pushMessageToChannel={pushMessage} />;

            case GAME_VIEW.RECORDING:
              return (
                <RecordingView
                  isContestant={
                    !!gameContext.players
                      ? gameContext.players
                          .map(({ musicianId }) => musicianId)
                          .includes(currMusicianId)
                      : false
                  }
                  pushMessageToChannel={pushMessage}
                  playSample={playSample}
                />
              );

            case GAME_VIEW.PLAYBACK_VOTING:
              return (
                <PlaybackVotingView
                  pushMessageToChannel={pushMessage}
                  contestants={
                    !!gameContext.contestants ? gameContext.contestants : []
                  }
                  playSample={playSample}
                />
              );

            case GAME_VIEW.ROUND_END:
              return <RoundEndView />;

            case GAME_VIEW.GAME_END:
              return <GameEndView />;
          }
        })()}
        <ClientDebug musicianId={currMusicianId} />
      </GameLayout>
    </GameContext.Provider>
  );
};
export { Game };
