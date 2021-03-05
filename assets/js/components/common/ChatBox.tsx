import React, { useState, useEffect, memo } from "react";

import { ChatMessage, Player } from "../../types";
import { useChatContext } from "../../hooks";
import { MAX_CHARS_PER_CHAT_MESSAGE } from "../../constants";

interface ChatBoxProps {
  players: Array<Player>;
}

const ChatBox: React.FC<ChatBoxProps> = memo(({ players }) => {
  const { chatHistory, submitChatMessageEvent } = useChatContext();

  const [messageTextBuffer, setMessageTextBuffer] = useState<string>("");

  const handleTextBufferChange = (e: any) => {
    setMessageTextBuffer(e.target.value);
  };

  const handleSubmitTextBuffer = () => {
    if (!!messageTextBuffer && messageTextBuffer.length > 0) {
      submitChatMessageEvent(messageTextBuffer.trim());
      setMessageTextBuffer("");
    }
  };

  return (
    <div className="chat_box inline_screen">
      <div className="chat_messages_container">
        {chatHistory.map(
          (
            { playerId, messageText }: ChatMessage,
            index: number
          ): JSX.Element => {
            return (
              <div key={index} className="chat_message_item">
                <div className="chat_message_author_label roboto_font">
                  {players.find((x) => x.playerId === playerId)?.playerAlias}
                </div>
                <div className="chat_message_text roboto_font">
                  {messageText}
                </div>
              </div>
            );
          }
        )}
      </div>
      <div className="chat_text_entry_container">
        <input
          className="chat_text_entry"
          type="text"
          id="chat_text_entry"
          name="chat_text_entry"
          maxLength={MAX_CHARS_PER_CHAT_MESSAGE}
          value={messageTextBuffer}
          onChange={handleTextBufferChange}
          onKeyDown={(e: any) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmitTextBuffer();
            }
          }}
        />
        <input
          className="chat_send_button"
          type="submit"
          value="SEND"
          onClick={() => handleSubmitTextBuffer()}
        />
      </div>
    </div>
  );
});
export { ChatBox };
