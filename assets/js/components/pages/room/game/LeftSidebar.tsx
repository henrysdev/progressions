import React from "react";
import { useGameContext, usePlayerContext } from "../../../../hooks";
import { Scoreboard } from "./Scoreboard";
import { Player } from "../../../../types";
import { GameSettings } from "./";

interface LeftSidebarProps {}

const LeftSidebar: React.FC<LeftSidebarProps> = ({}) => {
  const { players, readyUps, roundNum, scores } = useGameContext();
  const { player: currPlayer } = usePlayerContext();
  return (
    <div
      className="left_sidebar"
      style={{
        width: "220px",
        paddingRight: "8px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Scoreboard
        players={
          !!players
            ? roundNum === 1
              ? players
                  .filter((player) => readyUps.includes(player.musicianId))
                  .sort((a, b) => a.playerAlias.localeCompare(b.playerAlias))
              : players
            : ([] as Player[])
        }
        currPlayer={currPlayer}
        scores={scores}
      />
      <hr
        className="uk-divider"
        style={{
          borderBottom: "1px solid #e5e5e5",
          marginBottom: "8px",
          marginTop: "8px",
        }}
      ></hr>
      <GameSettings />
    </div>
  );
};
export { LeftSidebar };
