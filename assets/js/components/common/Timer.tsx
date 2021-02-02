import React, { memo } from "react";
import Countdown from "react-countdown";
import { Milliseconds } from "../../types";

interface TimerProps {
  duration: Milliseconds;
  descriptionText?: string;
  timesUpText?: string;
}
const Timer: React.FC<TimerProps> = memo(
  ({ duration, descriptionText, timesUpText }) => {
    console.log({ duration, descriptionText, timesUpText });
    // Renderer callback with condition
    const renderer = ({
      seconds,
      completed,
    }: {
      seconds: number;
      completed: boolean;
    }) => {
      if (completed) {
        // Render a completed state
        return <div>{timesUpText}</div>;
      } else {
        // Render a countdown
        return <span>{seconds}</span>;
      }
    };

    return (
      <div
        className="uk-text-center"
        style={{ fontSize: "16px", fontWeight: "bold" }}
      >
        {!!descriptionText ? <span>{descriptionText}</span> : <></>}
        <Countdown date={Date.now() + duration} renderer={renderer} />
      </div>
    );
  }
);
export { Timer };
