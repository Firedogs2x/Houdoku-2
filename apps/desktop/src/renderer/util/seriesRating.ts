type RatingContainer = {
  rating?: unknown;
};

const MIN_SERIES_RATING = 0;
const MAX_SERIES_RATING = 10;

export const normalizeSeriesRating = (rating: unknown): number => {
  const parsedRating =
    typeof rating === 'number'
      ? rating
      : typeof rating === 'string'
      ? Number(rating)
      : Number.NaN;

  if (!Number.isFinite(parsedRating)) return MIN_SERIES_RATING;

  return Math.min(MAX_SERIES_RATING, Math.max(MIN_SERIES_RATING, parsedRating));
};

export const getSeriesRatingValue = (series: RatingContainer): number =>
  normalizeSeriesRating(series.rating);

export const getSeriesRatingSelectValue = (series: RatingContainer): string =>
  `${getSeriesRatingValue(series)}`;
