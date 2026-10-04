import { classifyTrend, NOT_ENOUGH_DATA } from './trendVerdict.js';

// Four baseline periods averaging 100, then the period being judged, then a
// partial period that the verdict must ignore.
const seriesEndingWith = (latest, partial = 0) => [100, 100, 100, 100, latest, partial];

describe('classifyTrend', () => {
  it('calls 20% over baseline up and good', () => {
    expect(classifyTrend(seriesEndingWith(120))).toEqual({
      verdict: 'up',
      tone: 'good',
      latest: 120,
      baseline: 100,
      change: 0.2,
    });
  });

  it('calls 5% over baseline flat', () => {
    expect(classifyTrend(seriesEndingWith(105))).toMatchObject({
      verdict: 'flat',
      tone: 'neutral',
      change: 0.05,
    });
  });

  it('calls 20% under baseline down and bad', () => {
    expect(classifyTrend(seriesEndingWith(80))).toMatchObject({
      verdict: 'down',
      tone: 'bad',
      change: -0.2,
    });
  });

  it('turns a 20% rise into a bad verdict when higher is worse', () => {
    expect(classifyTrend(seriesEndingWith(120), { higherIsBetter: false })).toMatchObject({
      verdict: 'up',
      tone: 'bad',
    });
  });

  it('ignores a strong in-progress period', () => {
    expect(classifyTrend(seriesEndingWith(105, 5000))).toMatchObject({
      verdict: 'flat',
      latest: 105,
    });
  });

  it('averages the four periods before the latest, not just the one before', () => {
    expect(classifyTrend([999, 50, 150, 50, 150, 120, 0])).toMatchObject({
      verdict: 'up',
      baseline: 100,
      latest: 120,
    });
  });

  it('returns not enough data for an empty series', () => {
    expect(classifyTrend([])).toEqual({ verdict: NOT_ENOUGH_DATA });
  });

  it('returns not enough data with fewer than four prior complete periods', () => {
    expect(classifyTrend([100, 100, 100, 120, 0])).toEqual({ verdict: NOT_ENOUGH_DATA });
  });

  it('returns not enough data for an all-zero baseline instead of NaN or Infinity', () => {
    const result = classifyTrend([0, 0, 0, 0, 300, 0]);

    expect(result.verdict).toBe(NOT_ENOUGH_DATA);
    expect(result.change).toBeUndefined();
    expect(Object.values(result).every((value) => !Number.isNaN(value))).toBe(true);
    expect(Object.values(result)).not.toContain(Infinity);
  });

  it('returns not enough data when the baseline is under the minimum', () => {
    expect(classifyTrend([10, 0, 0, 10, 300, 0], { minimumBaseline: 100 })).toMatchObject({
      verdict: NOT_ENOUGH_DATA,
      baseline: 5,
    });
  });
});
