import * as Tone from "tone";
import {
  DEFAULT_SAMPLE_PLAY_BUFFER_LENGTH,
  DEFAULT_NUM_RECORDED_LOOPS,
  DEFAULT_NUM_WARMUP_LOOPS,
} from "../constants";
import { Milliseconds, Seconds, BackingTrackContextType } from "../types";
import { msToSec, secToMs, currUtcTimestamp } from "../utils";
import { sample } from "lodash";

interface ScheduleDeadlines {
  sampleStartTime: Seconds;
  recordingStartTime: Seconds;
  recordingEndTime: Seconds;
}

/**
 *  bufferTime = 5 seconds (the max time allowed for all clients to get view update)
 *  sampleTime = 10 seconds (the duration of the sample clip)
 *  recordTime = 30 seconds (the duration of the recording. Should be a multiple of the sampleTime)
 *
 *  serverSendTime      +5s              +15s             +45s
 *      | <-bufferTime-> | <-sampleTime-> | <-recordTime-> |
 *      |----------------|----------------|----------------|
 *      |                |                |                |
 *  view update    start sample    start recording    stop recording
 *
 *  view update - The client receives the push event to advance to the recording
 *                view. the serverSendTime field is included in the payload. The
 *                serverSendTime field is a UTC millisecond timestamp. The sample
 *                start will be scheduled for serverSendTime + bufferTime. To
 *                schedule this via ToneJS Transport, this scheduling time will
 *                need to be represented in terms of Transport time. A cast from
 *                UTC time to Transport time will need to take place.
 *
 *  start sample - The sample clip starts playing
 *
 *  start recording - Recording starts. The current timestep is used as timestep 0
 *                    for calculating timesteps.
 *
 *  stop recording - Recording is stopped and submitted.
 */

export function scheduleRecordingDeadlines(
  serverSendTimestamp: number,
  sampleStartPlayCallback: Function,
  startRecording: Function,
  stopRecording: Function,
  samplePlayer: any,
  backingTrackContext: BackingTrackContextType,
  setIsSamplePlaying: Function
): void {
  // get deadlines
  const deadlines = calcRecordingDeadlines(
    serverSendTimestamp,
    DEFAULT_SAMPLE_PLAY_BUFFER_LENGTH,
    Date,
    backingTrackContext
  );

  // schedule deadlines
  scheduleRecordingAudioTimeline(
    deadlines,
    sampleStartPlayCallback,
    startRecording,
    stopRecording,
    samplePlayer,
    backingTrackContext,
    setIsSamplePlaying
  );
}

export function getRecordingStartTimestamp(
  serverSendTimestamp: Milliseconds,
  backingTrackContext: BackingTrackContextType
): Milliseconds {
  const bufferTime = secToMs(DEFAULT_SAMPLE_PLAY_BUFFER_LENGTH);
  const sampleIntro = secToMs(backingTrackContext.warmUpTime);
  const recordingStartTimestamp = Math.abs(
    serverSendTimestamp + bufferTime + sampleIntro
  );
  return recordingStartTimestamp;
}

export function scheduleSamplePlay(
  samplePlayer: any,
  startTime: Seconds = 0,
  loopIterations: number,
  backingTrackContext: BackingTrackContextType
): void {
  if (samplePlayer.loaded && !!samplePlayer.buffer) {
    samplePlayer.start(`+${startTime}`);
    samplePlayer.stop(
      `+${startTime + loopIterations * backingTrackContext.sampleLength}`
    );
  }
}

function scheduleRecordingAudioTimeline(
  { sampleStartTime, recordingStartTime, recordingEndTime }: ScheduleDeadlines,
  sampleStartPlayCallback: Function,
  startRecording: Function,
  stopRecording: Function,
  samplePlayer: any,
  backingTrackContext: BackingTrackContextType,
  setIsSamplePlaying: Function
): void {
  Tone.Transport.start("+0");
  if (!!samplePlayer && !samplePlayer.loop) {
    console.log("Recording stage - set back to loop = true");
    samplePlayer.loop = true;
  }

  // start sample loop
  const loopIterations = DEFAULT_NUM_WARMUP_LOOPS + DEFAULT_NUM_RECORDED_LOOPS;

  scheduleSamplePlay(
    samplePlayer,
    sampleStartTime,
    loopIterations,
    backingTrackContext
  );

  // bug fix: redundant timer for updating UI when tab becomes background process
  // https://github.com/henrysdev/midimatches/issues/280
  setTimeout(() => {
    setIsSamplePlaying(true);
  }, sampleStartTime * 1000);

  // start sample (warmup)
  Tone.Transport.scheduleOnce((time: Seconds) => {
    Tone.Draw.schedule(() => {
      console.log("Start Sample Playback called!");
      sampleStartPlayCallback();
    }, time);
  }, `+${sampleStartTime}`);

  // start recording
  Tone.Transport.scheduleOnce((time: Seconds) => {
    startRecording(currUtcTimestamp());
  }, `+${recordingStartTime}`);

  // stop recording
  Tone.Transport.scheduleOnce((time: Seconds) => {
    stopRecording();
  }, `+${recordingEndTime}`);
}

export function calcRecordingDeadlines(
  serverSendTimestamp: Milliseconds, // ex: 1610577790924
  bufferTime: Seconds, // ex: 5
  date: any,
  backingTrackContext: BackingTrackContextType
): ScheduleDeadlines {
  const nowUtc: Milliseconds = currUtcTimestamp();

  const timeTilSampleStart = msToSec(
    Math.abs(serverSendTimestamp + secToMs(bufferTime) - nowUtc)
  );

  const sampleStartTime = timeTilSampleStart;
  const recordingStartTime = sampleStartTime + backingTrackContext.warmUpTime;
  const recordingEndTime =
    recordingStartTime + backingTrackContext.recordingTime;

  return {
    sampleStartTime,
    recordingStartTime,
    recordingEndTime,
  };
}
