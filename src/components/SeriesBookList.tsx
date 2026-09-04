import type { SeriesProgress } from "../lib/calculations";
import type { BookProgress } from "../types";
import { formatSeriesStatus } from "../lib/format";
import { BookRow } from "./BookRow";

interface SeriesBookListProps {
  series: SeriesProgress;
  isExpanded: boolean;
  onToggleExpand: () => void;
  readBookIds: Set<string>;
  onToggleBook: (bookId: string) => void;
  bookProgress: Map<string, BookProgress>;
  onSetProgress: (bookId: string, progress: BookProgress | null) => void;
}

export function SeriesBookList({
  series,
  isExpanded,
  onToggleExpand,
  readBookIds,
  onToggleBook,
  bookProgress,
  onSetProgress,
}: SeriesBookListProps) {
  const statusText = formatSeriesStatus(series.unreadCount, series.totalCount);

  const header = (
    <button
      type="button"
      className="series-header"
      aria-expanded={isExpanded}
      onClick={onToggleExpand}
    >
      <span className="series-name">{series.name}</span>
      <span className="series-leader" />
      <span className={`series-status${isExpanded ? " series-status--active" : ""}`}>
        {statusText}
      </span>
    </button>
  );

  if (!isExpanded) {
    return (
      <div className="series-row">
        {header}
        <div className="bar bar--mini">
          {series.books.map((book) => (
            <span
              key={book.id}
              className={`bar-segment${readBookIds.has(book.id) ? " bar-segment--filled" : ""}`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="series-panel">
      {header}
      <div className="book-list">
        {series.books.map((book) => (
          <BookRow
            key={book.id}
            book={book}
            read={readBookIds.has(book.id)}
            progress={bookProgress.get(book.id)}
            onToggle={onToggleBook}
            onSetProgress={onSetProgress}
          />
        ))}
      </div>
    </div>
  );
}
