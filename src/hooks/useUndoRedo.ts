import { useState, useCallback, useRef, useEffect } from 'react';

const HISTORY_DEBOUNCE_MS = 500;

export type UndoRedoSetter<T> = (
  newState: T | ((prev: T) => T),
  skipHistory?: boolean
) => void;

export function useUndoRedo<T>(initialState: T) {
  const [past, setPast] = useState<T[]>([]);
  const [present, setPresent] = useState<T>(initialState);
  const [future, setFuture] = useState<T[]>([]);
  const [hasPendingHistory, setHasPendingHistory] = useState(false);

  const presentRef = useRef(present);
  presentRef.current = present;

  const pendingSnapshotRef = useRef<T | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushPendingHistory = useCallback(() => {
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    const snapshot = pendingSnapshotRef.current;
    if (snapshot === null) return;
    pendingSnapshotRef.current = null;
    setHasPendingHistory(false);
    setPast((prevPast) => [...prevPast, snapshot]);
    setFuture([]);
  }, []);

  const scheduleDebouncedHistory = useCallback(
    (snapshot: T) => {
      if (pendingSnapshotRef.current === null) {
        pendingSnapshotRef.current = snapshot;
        setHasPendingHistory(true);
      }
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        debounceTimerRef.current = null;
        flushPendingHistory();
      }, HISTORY_DEBOUNCE_MS);
    },
    [flushPendingHistory]
  );

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const commitHistory = useCallback(() => {
    flushPendingHistory();
  }, [flushPendingHistory]);

  const set: UndoRedoSetter<T> = useCallback(
    (newState, skipHistory = false) => {
      if (!skipHistory && debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      setPresent((prevPresent) => {
        const resolvedState =
          typeof newState === 'function'
            ? (newState as (prev: T) => T)(prevPresent)
            : newState;

        if (resolvedState === prevPresent) {
          return prevPresent;
        }

        if (skipHistory) {
          scheduleDebouncedHistory(prevPresent);
          return resolvedState;
        }

        const pending = pendingSnapshotRef.current;
        if (pending !== null) {
          pendingSnapshotRef.current = null;
          setHasPendingHistory(false);
        }

        setPast((prevPast) => {
          if (pending !== null) {
            return [...prevPast, pending, prevPresent];
          }
          return [...prevPast, prevPresent];
        });
        setFuture([]);
        return resolvedState;
      });
    },
    [scheduleDebouncedHistory]
  );

  const canUndo = past.length > 0 || hasPendingHistory;
  const canRedo = future.length > 0;

  const undo = useCallback(() => {
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (pendingSnapshotRef.current !== null) {
      const snapshot = pendingSnapshotRef.current;
      pendingSnapshotRef.current = null;
      setHasPendingHistory(false);
      const current = presentRef.current;
      setFuture((prevFuture) => [current, ...prevFuture]);
      setPresent(snapshot);
      return;
    }

    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    setPast(newPast);
    setFuture((prevFuture) => [presentRef.current, ...prevFuture]);
    setPresent(previous);
  }, [past]);

  const redo = useCallback(() => {
    flushPendingHistory();
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);

    setPast((prevPast) => [...prevPast, presentRef.current]);
    setFuture(newFuture);
    setPresent(next);
  }, [future, flushPendingHistory]);

  const reset = useCallback((newInitialState: T) => {
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    pendingSnapshotRef.current = null;
    setHasPendingHistory(false);
    setPast([]);
    setPresent(newInitialState);
    setFuture([]);
  }, []);

  return { state: present, set, undo, redo, canUndo, canRedo, reset, commitHistory };
}
