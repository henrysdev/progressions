import React, { useState } from "react";

import { WarmUp } from ".";
import { User } from "../../../../types";
import { usePlayerContext } from "../../../../hooks";

interface PregameCenterPaneProps {
  gameInProgress: boolean;
  currentUser: User;
}

const PregameCenterPane: React.FC<PregameCenterPaneProps> = ({
  gameInProgress,
  currentUser,
}) => {
  const { isAudienceMember } = usePlayerContext();

  return (
    <div className="pregame_content_pane" style={{ marginLeft: "16px" }}>
      <div className="inline_screen inset_3d_border_shallow rounded_border">
        {gameInProgress ? (
          <div>
            <p>
              <strong>Game in progress.</strong> A new game will be starting in
              a few minutes. Feel free to
              <a href="/rooms">find another server</a> or play keyboard in the
              meantime.
            </p>
            <WarmUp />
          </div>
        ) : (
          <div>
            <div>
              <p>
                Joined successfully as{" "}
                {isAudienceMember ? "Audience Member" : "Player"}{" "}
                <strong>{currentUser.userAlias}</strong>.
              </p>
              {/* <WarmUp /> */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export { PregameCenterPane };
