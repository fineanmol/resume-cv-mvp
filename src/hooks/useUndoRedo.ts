import { useState, useCallback } from 'react';

export function useUndoRedo<T>(initialState: T) {
  const [past, setPast] = useState<T[]>([]);
  const [present, setPresent] = useState<T>(initialState);
  const [future, setFuture] = useState<T[]>([]);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  const set = useCallback((newState: T | ((prev: T) => T), skipHistory = false) => {
    setPresent((prevPresent) => {
      const resolvedState = typeof newState === 'function' ? (newState as Function)(prevPresent) : newState;
      
      if (skipHistory) {
        return resolvedState;
      }

      if (JSON.stringify(prevPresent) === JSON.stringify(resolvedState)) {
        return prevPresent;
      }

      setPast((prevPast) => [...prevPast, prevPresent]);
      setFuture([]);
      return resolvedState;
    });
  }, []);

  const undo = useCallback(() => {
    if (!canUndo) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    setPast(newPast);
    setFuture((prevFuture) => [present, ...prevFuture]);
    setPresent(previous);
  }, [canUndo, past, present]);

  const redo = useCallback(() => {
    if (!canRedo) return;
    const next = future[0];
    const newFuture = future.slice(1);

    setPast((prevPast) => [...prevPast, present]);
    setFuture(newFuture);
    setPresent(next);
  }, [canRedo, future, present]);

  const reset = useCallback((newInitialState: T) => {
    setPast([]);
    setPresent(newInitialState);
    setFuture([]);
  }, []);

  return { state: present, set, undo, redo, canUndo, canRedo, reset };
}
