"use client";

import { Heart } from "lucide-react";
import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "costapulse.favorite-experiences";
const listeners = new Set<() => void>();

function readFavorites(): Set<string> {
  if (typeof window === "undefined") {
    return new Set();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return new Set();
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return new Set();
    }
    return new Set(
      parsed.filter((value): value is string => typeof value === "string")
    );
  } catch {
    return new Set();
  }
}

function writeFavorites(ids: Set<string>) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getFavoriteSnapshot(experienceId: string) {
  return readFavorites().has(experienceId);
}

function getServerFavoriteSnapshot() {
  return false;
}

type FavoriteToggleProps = {
  experienceId: string;
  label: string;
};

export function FavoriteToggle({ experienceId, label }: FavoriteToggleProps) {
  const getSnapshot = useCallback(
    () => getFavoriteSnapshot(experienceId),
    [experienceId]
  );
  const favorited = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerFavoriteSnapshot
  );

  function toggleFavorite() {
    const next = readFavorites();
    if (next.has(experienceId)) {
      next.delete(experienceId);
    } else {
      next.add(experienceId);
    }
    writeFavorites(next);
  }

  return (
    <button
      type="button"
      className="experience-tile-favorite"
      aria-label={label}
      aria-pressed={favorited}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite();
      }}
    >
      <Heart
        size={18}
        aria-hidden
        fill={favorited ? "currentColor" : "none"}
        strokeWidth={favorited ? 0 : 2}
      />
    </button>
  );
}
