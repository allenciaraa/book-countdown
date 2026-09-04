import type { Series } from "../types";

interface SeriesSelectorProps {
  seriesList: Series[];
  includedSeriesIds: Set<string>;
  onToggleSeries: (seriesId: string) => void;
}

export function SeriesSelector({
  seriesList,
  includedSeriesIds,
  onToggleSeries,
}: SeriesSelectorProps) {
  return (
    <div className="chips-block">
      <div className="chips-label">Your chosen tales</div>
      <div className="chips-row">
        {seriesList.map((series) => {
          const selected = includedSeriesIds.has(series.id);
          return (
            <button
              key={series.id}
              type="button"
              role="checkbox"
              aria-checked={selected}
              className={`chip${selected ? " chip--selected" : " chip--unselected"}`}
              onClick={() => onToggleSeries(series.id)}
            >
              {series.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
