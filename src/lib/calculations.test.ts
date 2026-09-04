import { describe, expect, it } from "vitest";
import {
  daysRemaining,
  overallPercentComplete,
  remainingForBook,
  requiredMinutesPerDay,
  requiredPagesPerDay,
  roadAheadBooks,
  seriesProgressList,
  sumRemaining,
} from "./calculations";
import type { Book, BooksData } from "../types";

describe("daysRemaining", () => {
  it("counts today as day 1 when release is today", () => {
    const today = new Date(2026, 9, 27); // Oct 27, 2026
    expect(daysRemaining(today, "2026-10-27")).toBe(1);
  });

  it("counts inclusively across a multi-day span", () => {
    const today = new Date(2026, 7, 17); // Aug 17, 2026
    expect(daysRemaining(today, "2026-10-27")).toBe(72);
  });

  it("returns 0 the day after release", () => {
    const today = new Date(2026, 9, 28);
    expect(daysRemaining(today, "2026-10-27")).toBe(0);
  });

  it("returns negative values once well past the release date", () => {
    const today = new Date(2026, 10, 1);
    expect(daysRemaining(today, "2026-10-27")).toBe(-4);
  });

  it("is not affected by time-of-day on 'today'", () => {
    const morning = new Date(2026, 7, 17, 0, 30);
    const night = new Date(2026, 7, 17, 23, 45);
    expect(daysRemaining(morning, "2026-10-27")).toBe(
      daysRemaining(night, "2026-10-27"),
    );
  });
});

const data: BooksData = {
  newRelease: { title: "Test Release", releaseDate: "2026-10-27", confirmed: true },
  series: [
    {
      id: "a",
      name: "Series A",
      books: [
        { id: "a-1", title: "A1", order: 1, audiobookMinutes: 600, pages: 400, chapters: [] },
        { id: "a-2", title: "A2", order: 2, audiobookMinutes: 500, pages: 300, chapters: [] },
      ],
    },
    {
      id: "b",
      name: "Series B",
      books: [
        { id: "b-1", title: "B1", order: 1, audiobookMinutes: 700, pages: 450, chapters: [] },
      ],
    },
    {
      id: "empty",
      name: "Empty Series",
      books: [],
    },
  ],
};

describe("sumRemaining", () => {
  it("sums unread books across included series only", () => {
    const totals = sumRemaining(data, new Set(["a"]), new Set());
    expect(totals).toEqual({ totalMinutes: 1100, totalPages: 700, unreadBookCount: 2 });
  });

  it("excludes books marked as read", () => {
    const totals = sumRemaining(data, new Set(["a"]), new Set(["a-1"]));
    expect(totals).toEqual({ totalMinutes: 500, totalPages: 300, unreadBookCount: 1 });
  });

  it("returns zeros when no series are included", () => {
    const totals = sumRemaining(data, new Set(), new Set());
    expect(totals).toEqual({ totalMinutes: 0, totalPages: 0, unreadBookCount: 0 });
  });

  it("combines multiple included series", () => {
    const totals = sumRemaining(data, new Set(["a", "b"]), new Set());
    expect(totals).toEqual({ totalMinutes: 1800, totalPages: 1150, unreadBookCount: 3 });
  });

  it("does not throw for a series with no books", () => {
    const totals = sumRemaining(data, new Set(["empty"]), new Set());
    expect(totals).toEqual({ totalMinutes: 0, totalPages: 0, unreadBookCount: 0 });
  });

  it("returns zeros when every book in included series is read", () => {
    const totals = sumRemaining(data, new Set(["b"]), new Set(["b-1"]));
    expect(totals).toEqual({ totalMinutes: 0, totalPages: 0, unreadBookCount: 0 });
  });
});

describe("remainingForBook", () => {
  const book: Book = {
    id: "x-1",
    title: "X",
    order: 1,
    audiobookMinutes: 800,
    pages: 400,
    chapters: [],
  };

  it("returns the full book when there is no progress", () => {
    expect(remainingForBook(book)).toEqual({ minutes: 800, pages: 400 });
  });

  it("subtracts pages read and prorates minutes by the same fraction", () => {
    expect(remainingForBook(book, { unit: "pages", value: 100 })).toEqual({
      minutes: 600,
      pages: 300,
    });
  });

  it("subtracts minutes listened and prorates pages by the same fraction", () => {
    expect(remainingForBook(book, { unit: "minutes", value: 200 })).toEqual({
      minutes: 600,
      pages: 300,
    });
  });

  it("clamps progress past the end of the book to zero remaining", () => {
    expect(remainingForBook(book, { unit: "pages", value: 999 })).toEqual({
      minutes: 0,
      pages: 0,
    });
  });
});

describe("sumRemaining with progress", () => {
  it("reduces a book's contribution proportionally to its progress", () => {
    const totals = sumRemaining(
      data,
      new Set(["a"]),
      new Set(),
      new Map([["a-1", { unit: "pages", value: 200 }]]),
    );
    // a-1: 600min/400pp, half read -> 300min/200pp remain. a-2 untouched: 500min/300pp.
    expect(totals).toEqual({ totalMinutes: 800, totalPages: 500, unreadBookCount: 2 });
  });

  it("ignores progress on a book that's marked fully read", () => {
    const totals = sumRemaining(
      data,
      new Set(["a"]),
      new Set(["a-1"]),
      new Map([["a-1", { unit: "pages", value: 50 }]]),
    );
    expect(totals).toEqual({ totalMinutes: 500, totalPages: 300, unreadBookCount: 1 });
  });
});

describe("requiredMinutesPerDay", () => {
  it("divides total minutes by days left", () => {
    expect(requiredMinutesPerDay(600, 30)).toBe(20);
  });

  it("returns null once the release date has passed", () => {
    expect(requiredMinutesPerDay(600, 0)).toBeNull();
    expect(requiredMinutesPerDay(600, -3)).toBeNull();
  });

  it("handles a single remaining day without dividing by zero", () => {
    expect(requiredMinutesPerDay(600, 1)).toBe(600);
  });
});

describe("requiredPagesPerDay", () => {
  it("divides total pages by days left", () => {
    expect(requiredPagesPerDay(400, 20)).toBe(20);
  });

  it("returns null once the release date has passed", () => {
    expect(requiredPagesPerDay(400, 0)).toBeNull();
  });
});

describe("seriesProgressList", () => {
  it("returns only included series, in data order, sorted by book order", () => {
    const result = seriesProgressList(data, new Set(["b", "a"]), new Set());
    expect(result.map((s) => s.id)).toEqual(["a", "b"]);
    expect(result[0].books.map((b) => b.id)).toEqual(["a-1", "a-2"]);
  });

  it("computes unread and total counts", () => {
    const result = seriesProgressList(data, new Set(["a"]), new Set(["a-1"]));
    expect(result[0]).toMatchObject({ totalCount: 2, unreadCount: 1 });
  });

  it("handles a series with no books", () => {
    const result = seriesProgressList(data, new Set(["empty"]), new Set());
    expect(result[0]).toMatchObject({ totalCount: 0, unreadCount: 0, books: [] });
  });
});

describe("overallPercentComplete", () => {
  it("returns 0 when no series are included", () => {
    expect(overallPercentComplete(data, new Set(), new Set())).toBe(0);
  });

  it("computes the fraction of read books across included series", () => {
    expect(overallPercentComplete(data, new Set(["a", "b"]), new Set(["a-1", "b-1"]))).toBe(2 / 3);
  });
});

describe("roadAheadBooks", () => {
  it("flattens included series in reading order with read flags", () => {
    const result = roadAheadBooks(data, new Set(["a", "b"]), new Set(["a-2"]));
    expect(result).toEqual([
      { id: "a-1", title: "A1", minutes: 600, read: false },
      { id: "a-2", title: "A2", minutes: 500, read: true },
      { id: "b-1", title: "B1", minutes: 700, read: false },
    ]);
  });

  it("returns an empty list when no series are included", () => {
    expect(roadAheadBooks(data, new Set(), new Set())).toEqual([]);
  });
});
