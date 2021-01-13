import * as Tone from "tone";

// Audio Playback Types

export interface Note {
  instrument: string;
  key: number;
  duration: number;
}

export interface TimestepSlice {
  timestep: number;
  notes: Note[];
}

export interface Loop {
  startTimestep: number;
  length: number;
  timestepSlices: TimestepSlice[];
}

export interface Musician {
  musicianId: string;
  loop: Loop;
}

export interface MIDINoteEvent {
  value: number;
  velocity: number;
  receivedTimestep: number;
}

export interface LocalNoteEvent {
  time: number;
  note: any;
  velocity: number;
}

export type SamplePlayer = Tone.Player;

// Event Types

export interface ViewUpdatePayload {
  gameState: GameContextType;
}

export interface PlayerJoinPayload {
  musicianId: string;
}

// Payload Types

export interface GameRules {
  gameSizeNumPlayers: number;
  timestepSize: number;
  soloTimeLimit: number;
  quantizationThreshold: number;
}

export interface GameContextType {
  // static fields
  gameRules: GameRules;
  roomId?: string;

  // dynamic fields
  gameView: string;
  musicians?: string[];
  numVotesCast?: number;
  readyUps?: any;
  recordings?: Object;
  roundRecordingStartTime?: number;
  winner?: any;
  contestants?: string[];
  judges?: string[];
}

// Time Types
type Seconds = number;
type Milliseconds = number;
