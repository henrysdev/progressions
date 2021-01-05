import React, { useContext, useEffect } from 'react';
import * as Tone from 'tone';

import { SUBMIT_VOTE_EVENT } from '../../../../../constants';
import { GameContext } from '../../../../../contexts';
import { GameContextType } from '../../../../../types';
import { RecordingPlayer } from '../../../../audio';
import { SimpleButton } from '../../../../common';

interface PlaybackVotingViewProps {
  pushMessageToChannel: Function;
  eligibleMusiciansToVoteFor: string[];
}

const PlaybackVotingView: React.FC<PlaybackVotingViewProps> = ({
  pushMessageToChannel,
  eligibleMusiciansToVoteFor,
}) => {
  const { recordings }: GameContextType = useContext(GameContext);

  useEffect(() => {
    if (!!recordings) {
      // Object.entries(recordings).reduce((now, [musicianId, recording]) => {
      //   scheduleRecording(ß
      //     recording,
      //     now,
      //     timestepSize,
      //     soloTimeLimit,
      //     playNote
      //   );
      //   return now + soloTimeLimit;
      // }, Tone.now());
    }
  }, [recordings]);

  return (
    <div>
      <h3>PlaybackVoting View</h3>
      {eligibleMusiciansToVoteFor.map((musicianId: string) => {
        return (
          <div key={`${musicianId}`}>
            <SimpleButton
              key={`vote-${musicianId}`}
              label={`Vote for ${musicianId}`}
              callback={() => {
                pushMessageToChannel(SUBMIT_VOTE_EVENT, {
                  vote: musicianId,
                });
              }}
              disabled={false}
            />
            {Object.entries(recordings).map(([musicianId, recording]) => {
              return (
                <RecordingPlayer
                  key={`recording-player-${musicianId}`}
                  recording={recording}
                  musicianId={musicianId}
                  scheduledStartTime={Tone.now()}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
export { PlaybackVotingView };
