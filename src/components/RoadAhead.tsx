import type { RoadAheadBook } from "../lib/calculations";

interface RoadAheadProps {
  books: RoadAheadBook[];
}

export function RoadAhead({ books }: RoadAheadProps) {
  if (books.length === 0) return null;

  const maxMinutes = Math.max(...books.map((book) => book.minutes));
  const readCount = books.filter((book) => book.read).length;

  return (
    <div className="road">
      <div className="road-chart">
        {books.map((book) => (
          <span
            key={book.id}
            title={book.title}
            className={`road-bar${book.read ? " road-bar--read" : " road-bar--unread"}`}
            style={{
              height: `${(0.23 + (book.minutes / maxMinutes) * 0.59) * 100}%`,
            }}
          />
        ))}
      </div>
      <div className="road-hairline" />
      <div className="road-caption">
        <span>filled = read &middot; height = length</span>
        <span>
          {readCount} of {books.length} behind you
        </span>
      </div>
    </div>
  );
}
