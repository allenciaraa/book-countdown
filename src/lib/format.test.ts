import { describe, expect, it } from "vitest";
import {
  formatDaysRemaining,
  formatDuration,
  formatMinutesPacePerDay,
  formatNumber,
  formatPacePerDay,
  formatReleaseDate,
  formatSeriesStatus,
  numberWord,
  pluralizeDay,
} from "./format";

describe("formatDuration", () => {
  it("formats minutes under an hour without an hour prefix", () => {
    expect(formatDuration(45)).toBe("45m");
  });

  it("formats exact hours", () => {
    expect(formatDuration(60)).toBe("1h 0m");
  });

  it("formats hours and minutes", () => {
    expect(formatDuration(605)).toBe("10h 5m");
  });

  it("rounds fractional minutes", () => {
    expect(formatDuration(90.6)).toBe("1h 31m");
  });
});

describe("pluralizeDay", () => {
  it("is singular for 1", () => {
    expect(pluralizeDay(1)).toBe("day");
  });

  it("is plural for 0 and for values greater than 1", () => {
    expect(pluralizeDay(0)).toBe("days");
    expect(pluralizeDay(2)).toBe("days");
  });
});

describe("formatDaysRemaining", () => {
  it("combines the count and pluralized unit", () => {
    expect(formatDaysRemaining(1)).toBe("1 day");
    expect(formatDaysRemaining(5)).toBe("5 days");
  });
});

describe("formatNumber", () => {
  it("adds comma separators for large numbers", () => {
    expect(formatNumber(1234)).toBe("1,234");
  });

  it("leaves small numbers unchanged", () => {
    expect(formatNumber(42)).toBe("42");
  });
});

describe("formatPacePerDay", () => {
  it("combines a formatted number with a unit label", () => {
    expect(formatPacePerDay(18, "pages")).toBe("18 pages/day");
    expect(formatPacePerDay(1234, "min")).toBe("1,234 min/day");
  });
});

describe("formatMinutesPacePerDay", () => {
  it("uses min/day format at or below 59 minutes", () => {
    expect(formatMinutesPacePerDay(45)).toBe("45 min/day");
    expect(formatMinutesPacePerDay(59)).toBe("59 min/day");
  });

  it("switches to hour/minute format above 59 minutes", () => {
    expect(formatMinutesPacePerDay(60)).toBe("1h 0m/day");
    expect(formatMinutesPacePerDay(605)).toBe("10h 5m/day");
  });
});

describe("formatReleaseDate", () => {
  it("formats an ISO date as a long-form local date, unaffected by UTC parsing shifts", () => {
    expect(formatReleaseDate("2026-10-27")).toBe("October 27, 2026");
  });
});

describe("numberWord", () => {
  it("spells out numbers up to twelve", () => {
    expect(numberWord(0)).toBe("zero");
    expect(numberWord(4)).toBe("four");
    expect(numberWord(12)).toBe("twelve");
  });

  it("falls back to the digit above twelve", () => {
    expect(numberWord(13)).toBe("13");
  });
});

describe("formatSeriesStatus", () => {
  it("spells out a partial remainder", () => {
    expect(formatSeriesStatus(4, 7)).toBe("four of seven remain");
  });

  it("uses 'all' when nothing has been read", () => {
    expect(formatSeriesStatus(5, 5)).toBe("all five remain");
  });

  it("uses 'none' when everything has been read", () => {
    expect(formatSeriesStatus(0, 5)).toBe("none remain");
  });

  it("handles a series with no books", () => {
    expect(formatSeriesStatus(0, 0)).toBe("no books yet");
  });
});
