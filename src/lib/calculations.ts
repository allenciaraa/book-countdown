import type { Book, BookProgress, BooksData } from "../types";

export interface RemainingTotals {
  totalMinutes: number;
  totalPages: number;
  unreadBookCount: number;
}

export interface BookRemaining {
  minutes: number;
  pages: number;
}

/**
 * Minutes/pages left in a single book. With no progress, that's the full
 * book. With progress in one unit (pages read, or minutes listened), the
 * other unit is prorated by the same fraction remaining — there's no
 * chapter-level mapping between page and audio position, so this is an
 * estimate, not an exact cross-reference.
 */
export function remainingForBook(book: Book, progress?: BookProgress): BookRemaining {
  if (!progress) return { minutes: book.audiobookMinutes, pages: book.pages };

  if (progress.unit === "pages") {
    const remainingPages = Math.max(book.pages - progress.value, 0);
    const fractionRemaining = book.pages === 0 ? 0 : remainingPages / book.pages;
    return { minutes: book.audiobookMinutes * fractionRemaining, pages: remainingPages };
  }

  const remainingMinutes = Math.max(book.audiobookMinutes - progress.value, 0);
  const fractionRemaining =
    book.audiobookMinutes === 0 ? 0 : remainingMinutes / book.audiobookMinutes;
  return { minutes: remainingMinutes, pages: book.pages * fractionRemaining };
}

const MS_PER_DAY = 86_400_000;

/**
 * Days remaining until releaseDateISO, inclusive of `today` (today counts
 * as a reading day). Both dates are compared as local-timezone,
 * calendar-date-only values to avoid UTC/DST off-by-one errors.
 */
export function daysRemaining(today: Date, releaseDateISO: string): number {
  const todayMidnight = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const [year, month, day] = releaseDateISO.split("-").map(Number);
  const releaseMidnight = new Date(year, month - 1, day);

  return (
    Math.round((releaseMidnight.getTime() - todayMidnight.getTime()) / MS_PER_DAY) + 1
  );
}

export function sumRemaining(
  data: BooksData,
  includedSeriesIds: Set<string>,
  readBookIds: Set<string>,
  bookProgress: Map<string, BookProgress> = new Map(),
): RemainingTotals {
  let totalMinutes = 0;
  let totalPages = 0;
  let unreadBookCount = 0;

  for (const series of data.series) {
    if (!includedSeriesIds.has(series.id)) continue;
    for (const book of series.books) {
      if (readBookIds.has(book.id)) continue;
      const remaining = remainingForBook(book, bookProgress.get(book.id));
      totalMinutes += remaining.minutes;
      totalPages += remaining.pages;
      unreadBookCount += 1;
    }
  }

  return { totalMinutes, totalPages, unreadBookCount };
}

export function requiredMinutesPerDay(
  totalMinutes: number,
  daysLeft: number,
): number | null {
  if (daysLeft <= 0) return null;
  return totalMinutes / daysLeft;
}

export function requiredPagesPerDay(
  totalPages: number,
  daysLeft: number,
): number | null {
  if (daysLeft <= 0) return null;
  return totalPages / daysLeft;
}

export interface SeriesProgress {
  id: string;
  name: string;
  books: Book[];
  totalCount: number;
  unreadCount: number;
}

/** Included series, in data order, with books sorted by reading order. */
export function seriesProgressList(
  data: BooksData,
  includedSeriesIds: Set<string>,
  readBookIds: Set<string>,
): SeriesProgress[] {
  return data.series
    .filter((series) => includedSeriesIds.has(series.id))
    .map((series) => {
      const books = series.books.slice().sort((a, b) => a.order - b.order);
      const unreadCount = books.filter((book) => !readBookIds.has(book.id)).length;
      return { id: series.id, name: series.name, books, totalCount: books.length, unreadCount };
    });
}

/** Fraction (0-1) of books read, across every included series. */
export function overallPercentComplete(
  data: BooksData,
  includedSeriesIds: Set<string>,
  readBookIds: Set<string>,
): number {
  let total = 0;
  let read = 0;

  for (const series of data.series) {
    if (!includedSeriesIds.has(series.id)) continue;
    for (const book of series.books) {
      total += 1;
      if (readBookIds.has(book.id)) read += 1;
    }
  }

  return total === 0 ? 0 : read / total;
}

export interface RoadAheadBook {
  id: string;
  title: string;
  minutes: number;
  read: boolean;
}

/** Every book across included series, in reading order (series order, then book order). */
export function roadAheadBooks(
  data: BooksData,
  includedSeriesIds: Set<string>,
  readBookIds: Set<string>,
): RoadAheadBook[] {
  const books: RoadAheadBook[] = [];

  for (const series of data.series) {
    if (!includedSeriesIds.has(series.id)) continue;
    for (const book of series.books.slice().sort((a, b) => a.order - b.order)) {
      books.push({
        id: book.id,
        title: book.title,
        minutes: book.audiobookMinutes,
        read: readBookIds.has(book.id),
      });
    }
  }

  return books;
}
