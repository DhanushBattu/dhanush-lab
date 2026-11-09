"use client";
import { useSyncExternalStore } from "react";

/** Tiny global UI store — avoids prop-drilling for overlays opened from anywhere. */
type State = {
  booted: boolean; // loader finished
  assistantOpen: boolean;
  resumeOpen: boolean;
  room: RoomId | null; // which project room is open (projects live off the main page)
  roomFrom: string | null; // clip-path of the card the room grew out of
};

export type RoomId = "automation" | "veriai" | "rental" | "cafe" | "ipl";

let state: State = { booted: false, assistantOpen: false, resumeOpen: false, room: null, roomFrom: null };
const listeners = new Set<() => void>();

export const ui = {
  get: () => state,
  set(patch: Partial<State>) {
    state = { ...state, ...patch };
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

/** Open a project room so it grows out of the card that was clicked (a Flip-style reveal). */
export function openRoom(id: RoomId, from?: Element | null) {
  let roomFrom: string | null = null;
  if (from && typeof window !== "undefined") {
    const r = from.getBoundingClientRect();
    const t = Math.max(0, r.top), l = Math.max(0, r.left);
    const b = Math.max(0, window.innerHeight - r.bottom), rt = Math.max(0, window.innerWidth - r.right);
    roomFrom = `inset(${t}px ${rt}px ${b}px ${l}px round 6px)`;
  }
  state = { ...state, roomFrom };
  ui.set({ room: id });
}

const serverState = state;
export function useUI<T>(select: (s: State) => T): T {
  return useSyncExternalStore(ui.subscribe, () => select(state), () => select(serverState));
}
