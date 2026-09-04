import { useCallback, useEffect, useMemo, useState } from "react";
import booksData from "./data/books.json";
import type { BookProgress, BooksData, Season } from "./types";
import {
  daysRemaining,
  overallPercentComplete,
  requiredMinutesPerDay,
  requiredPagesPerDay,
  roadAheadBooks,
  seriesProgressList,
  sumRemaining,
} from "./lib/calculations";
import { formatReleaseDate } from "./lib/format";
import { SeriesSelector } from "./components/SeriesSelector";
import { SeriesBookList } from "./components/SeriesBookList";
import { PaceCard } from "./components/PaceCard";
import { RoadAhead } from "./components/RoadAhead";
import { SeasonSwitcher } from "./components/SeasonSwitcher";
import { StarlightStars } from "./components/StarlightStars";
import "./App.css";

const data = booksData as BooksData;

const SEASON_STORAGE_KEY = "sarahjmaths.season";

// Below this width the series grid is a single column, so only one expanded
// panel is allowed at a time (an accordion) to keep the page from sprawling.
// At and above it there's room for panels side by side, so expansion is
// per-series and several can be open together.
const WIDE_QUERY = "(min-width: 860px)";

function loadStoredSeason(): Season {
  if (typeof window === "undefined") return "night";
  const stored = window.localStorage.getItem(SEASON_STORAGE_KEY);
  return stored === "night" || stored === "spring" || stored === "fall" ? stored : "night";
}

// Books default to read: the picker asks the user to flag what they HAVEN'T
// read, so anything left untouched should count as already finished.
function allBookIds(data: BooksData): Set<string> {
  return new Set(data.series.flatMap((series) => series.books.map((book) => book.id)));
}

function useIsWide(): boolean {
  const [isWide, setIsWide] = useState(
    () => typeof window !== "undefined" && window.matchMedia(WIDE_QUERY).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(WIDE_QUERY);
    const onChange = () => setIsWide(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isWide;
}

function App() {
  const [includedSeriesIds, setIncludedSeriesIds] = useState<Set<string>>(new Set());
  const [readBookIds, setReadBookIds] = useState<Set<string>>(() => allBookIds(data));
  const [bookProgress, setBookProgress] = useState<Map<string, BookProgress>>(new Map());
  const [season, setSeason] = useState<Season>(loadStoredSeason);
  const [expandedSeriesIds, setExpandedSeriesIds] = useState<Set<string>>(new Set());
  const isWide = useIsWide();
  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    window.localStorage.setItem(SEASON_STORAGE_KEY, season);
    document.documentElement.dataset.season = season;
  }, [season]);

  // Dropping below the wide breakpoint collapses back to an accordion: keep
  // whichever panel was opened first rather than leaving several stacked tall.
  useEffect(() => {
    if (isWide) return;
    setExpandedSeriesIds((prev) => {
      if (prev.size <= 1) return prev;
      const [first] = prev;
      return new Set([first]);
    });
  }, [isWide]);

  const toggleExpanded = useCallback(
    (seriesId: string) => {
      setExpandedSeriesIds((prev) => {
        const next = new Set(prev);
        if (next.has(seriesId)) {
          next.delete(seriesId);
        } else {
          if (!isWide) next.clear();
          next.add(seriesId);
        }
        return next;
      });
    },
    [isWide],
  );

  const toggleSeries = useCallback(
    (seriesId: string) => {
      const isSelecting = !includedSeriesIds.has(seriesId);

      setIncludedSeriesIds((prev) => {
        const next = new Set(prev);
        if (isSelecting) next.add(seriesId);
        else next.delete(seriesId);
        return next;
      });

      setExpandedSeriesIds((prev) => {
        if (!isSelecting) {
          if (!prev.has(seriesId)) return prev;
          const next = new Set(prev);
          next.delete(seriesId);
          return next;
        }
        // A newly chosen series starts open: alongside the others on a wide
        // screen, or as the sole open one in the mobile accordion.
        if (isWide) return new Set(prev).add(seriesId);
        return new Set([seriesId]);
      });
    },
    [includedSeriesIds, isWide],
  );

  const toggleBook = useCallback((bookId: string) => {
    setReadBookIds((prev) => {
      const next = new Set(prev);
      if (next.has(bookId)) next.delete(bookId);
      else next.add(bookId);
      return next;
    });
  }, []);

  const setProgressForBook = useCallback(
    (bookId: string, progress: BookProgress | null) => {
      setBookProgress((prev) => {
        const next = new Map(prev);
        if (progress === null) next.delete(bookId);
        else next.set(bookId, progress);
        return next;
      });
    },
    [],
  );

  const daysLeft = useMemo(
    () => daysRemaining(today, data.newRelease.releaseDate),
    [today],
  );

  const totals = useMemo(
    () => sumRemaining(data, includedSeriesIds, readBookIds, bookProgress),
    [includedSeriesIds, readBookIds, bookProgress],
  );

  const paceMinutes = useMemo(
    () => requiredMinutesPerDay(totals.totalMinutes, daysLeft),
    [totals.totalMinutes, daysLeft],
  );

  const pacePages = useMemo(
    () => requiredPagesPerDay(totals.totalPages, daysLeft),
    [totals.totalPages, daysLeft],
  );

  const percentComplete = useMemo(
    () => overallPercentComplete(data, includedSeriesIds, readBookIds),
    [includedSeriesIds, readBookIds],
  );

  const seriesProgress = useMemo(
    () => seriesProgressList(data, includedSeriesIds, readBookIds),
    [includedSeriesIds, readBookIds],
  );

  const roadBooks = useMemo(
    () => roadAheadBooks(data, includedSeriesIds, readBookIds),
    [includedSeriesIds, readBookIds],
  );

  const fallbackExpandedId = useMemo(() => {
    const withUnread = seriesProgress.find((series) => series.unreadCount > 0);
    return (withUnread ?? seriesProgress[0])?.id ?? null;
  }, [seriesProgress]);

  // Keep expandedSeriesIds pruned to currently-included series, and seed it
  // with a default once nothing is expanded — as real state, not a derived
  // stand-in, so that default stays open when the user opens another panel
  // alongside it instead of silently vanishing.
  useEffect(() => {
    setExpandedSeriesIds((prev) => {
      const active = [...prev].filter((id) => includedSeriesIds.has(id));
      if (active.length > 0) {
        return active.length === prev.size ? prev : new Set(active);
      }
      if (fallbackExpandedId) return new Set([fallbackExpandedId]);
      return prev.size === 0 ? prev : new Set();
    });
  }, [includedSeriesIds, fallbackExpandedId]);

  const hasIncludedSeries = includedSeriesIds.size > 0;

  return (
    <div className="page">
      {season === "night" && <StarlightStars />}
      <div className="frame-outer">
        <div className="frame-inner">
          <div className="content">
            <PaceCard
              releaseTitle={data.newRelease.title}
              releaseDateDisplay={formatReleaseDate(data.newRelease.releaseDate)}
              confirmed={data.newRelease.confirmed}
              daysLeft={daysLeft}
              hasIncludedSeries={hasIncludedSeries}
              unreadBookCount={totals.unreadBookCount}
              requiredMinutesPerDay={paceMinutes}
              requiredPagesPerDay={pacePages}
              totals={totals}
              percentComplete={percentComplete}
            />

            <SeriesSelector
              seriesList={data.series}
              includedSeriesIds={includedSeriesIds}
              onToggleSeries={toggleSeries}
            />

            {seriesProgress.length > 0 && (
              <div className="series-grid">
                {seriesProgress.map((series) => (
                  <SeriesBookList
                    key={series.id}
                    series={series}
                    isExpanded={expandedSeriesIds.has(series.id)}
                    onToggleExpand={() => toggleExpanded(series.id)}
                    readBookIds={readBookIds}
                    onToggleBook={toggleBook}
                    bookProgress={bookProgress}
                    onSetProgress={setProgressForBook}
                  />
                ))}
              </div>
            )}

            <RoadAhead books={roadBooks} />

            <SeasonSwitcher season={season} onChange={setSeason} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
