import type { RemainingTotals } from "../lib/calculations";
import {
  formatDuration,
  formatMinutesPacePerDay,
  formatNumber,
  formatPacePerDay,
} from "../lib/format";

interface PaceCardProps {
  releaseTitle: string;
  releaseDateDisplay: string;
  confirmed: boolean;
  daysLeft: number;
  hasIncludedSeries: boolean;
  unreadBookCount: number;
  requiredMinutesPerDay: number | null;
  requiredPagesPerDay: number | null;
  totals: RemainingTotals;
  percentComplete: number;
}

const SEGMENT_COUNT = 12;

export function PaceCard({
  releaseTitle,
  releaseDateDisplay,
  confirmed,
  daysLeft,
  hasIncludedSeries,
  unreadBookCount,
  requiredMinutesPerDay,
  requiredPagesPerDay,
  totals,
  percentComplete,
}: PaceCardProps) {
  const showPassed = daysLeft <= 0;
  const showDash = !hasIncludedSeries || unreadBookCount === 0;
  const filledSegments = Math.round(percentComplete * SEGMENT_COUNT);

  return (
    <>
      <div className="plate-title">
        <div className="plate-eyebrow">In which the reader prepares for</div>
        <div className="plate-heading">{releaseTitle}</div>
        <div className="plate-date-rule">
          <span className="plate-date-rule-line" />
          <span className="plate-date-rule-text">
            {releaseDateDisplay}
            {!confirmed && " (date unconfirmed)"}
          </span>
          <span className="plate-date-rule-line" />
        </div>
      </div>

      <div className="pace-band">
        <div className="pace-left">
          <div className="pace-days">{daysLeft}</div>
          <div className="pace-info">
            <div className="pace-label">days remain</div>
            {showPassed ? (
              <p className="pace-passed">Release date has passed &mdash; showing totals only.</p>
            ) : (
              <>
                <div className="pace-row pace-row--divided">
                  <span className="pace-row-label">to listen</span>
                  <span className="pace-row-value">
                    {showDash ? "—" : formatMinutesPacePerDay(requiredMinutesPerDay ?? 0)}
                  </span>
                </div>
                <div className="pace-row">
                  <span className="pace-row-label">or to read</span>
                  <span className="pace-row-value">
                    {showDash ? "—" : formatPacePerDay(requiredPagesPerDay ?? 0, "pages")}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="pace-right">
          <div className="bar bar--overall">
            {Array.from({ length: SEGMENT_COUNT }, (_, i) => (
              <span
                key={i}
                className={`bar-segment${i < filledSegments ? " bar-segment--filled" : ""}`}
              />
            ))}
          </div>
          <div className="progress-totals">
            {formatDuration(totals.totalMinutes)} &middot; {formatNumber(totals.totalPages)} pages
            yet unread
          </div>
        </div>
      </div>
    </>
  );
}
