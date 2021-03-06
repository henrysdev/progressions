import { Microseconds, Milliseconds, Seconds } from "../types";

export function secToMs(time: Seconds): Milliseconds {
  return time * 1000;
}
export function msToSec(time: Milliseconds): Seconds {
  return time * 0.001;
}

export function msToMicros(time: Milliseconds): Microseconds {
  return time * 1000;
}

export function microsToMs(time: Microseconds): Milliseconds {
  return time * 0.001;
}

export function currUtcTimestamp(): Milliseconds {
  return Date.now();
}

export function calcMsUntilMsTimestamp(futureTime: Milliseconds): Milliseconds {
  return futureTime - currUtcTimestamp();
}
