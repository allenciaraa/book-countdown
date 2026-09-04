import type { KeyboardEvent, MouseEvent } from "react";
import { useState } from "react";
import type { Book, BookProgress } from "../types";
import { remainingForBook } from "../lib/calculations";
import { formatDuration, formatNumber } from "../lib/format";

interface BookRowProps {
  book: Book;
  read: boolean;
  progress: BookProgress | undefined;
  onToggle: (bookId: string) => void;
  onSetProgress: (bookId: string, progress: BookProgress | null) => void;
}

export function BookRow({ book, read, progress, onToggle, onSetProgress }: BookRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [unit, setUnit] = useState<"pages" | "minutes">(progress?.unit ?? "pages");
  const [pageInput, setPageInput] = useState(
    progress?.unit === "pages" ? String(progress.value) : "",
  );
  const [hourInput, setHourInput] = useState(
    progress?.unit === "minutes"
      ? String(Math.floor((book.audiobookMinutes - progress.value) / 60))
      : "",
  );
  const [minuteInput, setMinuteInput] = useState(
    progress?.unit === "minutes"
      ? String((book.audiobookMinutes - progress.value) % 60)
      : "",
  );

  const remaining = read ? { minutes: 0, pages: 0 } : remainingForBook(book, progress);
  const hasProgress = !read && progress !== undefined;

  function commitPages(raw: string) {
    setPageInput(raw);
    const n = Number(raw);
    if (raw.trim() === "" || Number.isNaN(n)) {
      onSetProgress(book.id, null);
      return;
    }
    onSetProgress(book.id, { unit: "pages", value: Math.max(0, Math.min(n, book.pages)) });
  }

  function commitMinutes(hoursRaw: string, minutesRaw: string) {
    setHourInput(hoursRaw);
    setMinuteInput(minutesRaw);
    if (hoursRaw.trim() === "" && minutesRaw.trim() === "") {
      onSetProgress(book.id, null);
      return;
    }
    const h = Number(hoursRaw) || 0;
    const m = Number(minutesRaw) || 0;
    const minutesLeft = Math.max(0, Math.min(h * 60 + m, book.audiobookMinutes));
    onSetProgress(book.id, {
      unit: "minutes",
      value: book.audiobookMinutes - minutesLeft,
    });
  }

  function clearProgress() {
    setPageInput("");
    setHourInput("");
    setMinuteInput("");
    onSetProgress(book.id, null);
  }

  function handleRowKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle(book.id);
    }
  }

  function toggleEditing(e: MouseEvent) {
    e.stopPropagation();
    setIsEditing((v) => !v);
  }

  return (
    <div className="book-row-wrap">
      <div
        role="checkbox"
        aria-checked={!read}
        tabIndex={0}
        className="book-row"
        onClick={() => onToggle(book.id)}
        onKeyDown={handleRowKeyDown}
      >
        <span className={`book-checkbox${!read ? " book-checkbox--checked" : ""}`}>
          {!read && (
            <svg viewBox="0 0 24 24" width="9" height="9" aria-hidden="true">
              <polyline
                points="4 12 9.5 18 20 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
        <span className="book-row-main">
          <span className={`book-row-title${read ? " book-row-title--read" : ""}`}>{book.title}</span>
          {!read && (
            <button
              type="button"
              className="book-progress-inline"
              aria-expanded={isEditing}
              onClick={toggleEditing}
            >
              {hasProgress ? "editing progress" : "in progress?"}
            </button>
          )}
        </span>
        <span className="book-row-meta">
          {formatDuration(remaining.minutes)} &middot; {formatNumber(remaining.pages)} pp
          {hasProgress ? " left" : ""}
        </span>
      </div>

      {!read && isEditing && (
        <div className="book-progress-form">
          <div className="book-progress-unit-toggle" role="radiogroup" aria-label="progress unit">
            <button
              type="button"
              role="radio"
              aria-checked={unit === "pages"}
              className={`book-progress-unit${unit === "pages" ? " book-progress-unit--active" : ""}`}
              onClick={() => setUnit("pages")}
            >
              Page
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={unit === "minutes"}
              className={`book-progress-unit${unit === "minutes" ? " book-progress-unit--active" : ""}`}
              onClick={() => setUnit("minutes")}
            >
              Time left
            </button>
          </div>

          {unit === "pages" ? (
            <label className="book-progress-field">
              on page
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={book.pages}
                value={pageInput}
                onChange={(e) => commitPages(e.target.value)}
              />
              of {formatNumber(book.pages)}
            </label>
          ) : (
            <label className="book-progress-field">
              with
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={hourInput}
                onChange={(e) => commitMinutes(e.target.value, minuteInput)}
              />
              h
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={59}
                value={minuteInput}
                onChange={(e) => commitMinutes(hourInput, e.target.value)}
              />
              m left of {formatDuration(book.audiobookMinutes)}
            </label>
          )}

          {hasProgress && (
            <button type="button" className="book-progress-clear" onClick={clearProgress}>
              clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}
