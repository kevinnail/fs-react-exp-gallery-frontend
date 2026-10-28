import { useEffect, useState } from 'react';
import { getChartChatSummary } from '../../../services/fetch-chart-chats.js';
import { formatBucket } from './chartFormat.js';

const ChartChatSummary = ({ granularity, range }) => {
  const [summaries, setSummaries] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // A slower earlier request must not overwrite the one for the current controls.
    let isCurrentRequest = true;

    const loadSummaries = async () => {
      setError('');
      try {
        const loadedSummaries = await getChartChatSummary({ granularity, range });
        if (isCurrentRequest) setSummaries(loadedSummaries);
      } catch (loadError) {
        if (isCurrentRequest) setError(loadError.message);
      }
    };
    loadSummaries();

    return () => {
      isCurrentRequest = false;
    };
  }, [granularity, range]);

  const describePoint = (point) => `${point.value} (${formatBucket(point.period, granularity)})`;

  const renderContent = () => {
    if (error) return <p className="charts-error">{error}</p>;
    if (!summaries) return <p className="charts-loading">Loading data summary</p>;

    return (
      <div className="chart-chat-summary-scroll">
        <table className="chart-chat-summary-table">
          <thead>
            <tr>
              <th scope="col">Metric</th>
              <th scope="col">Total</th>
              <th scope="col">Average per period</th>
              <th scope="col">High</th>
              <th scope="col">Low</th>
              <th scope="col">First to last</th>
              <th scope="col">Trend</th>
              <th scope="col">Current period so far</th>
            </tr>
          </thead>
          <tbody>
            {summaries.map(({ metric, meaning, completePeriods, trend, currentPeriodSoFar }) => (
              <tr key={metric}>
                <th scope="row">{meaning}</th>
                {completePeriods.note ? (
                  <td colSpan={5}>{completePeriods.note}</td>
                ) : (
                  <>
                    <td>{completePeriods.total}</td>
                    <td>{completePeriods.averagePerPeriod}</td>
                    <td>{describePoint(completePeriods.high)}</td>
                    <td>{describePoint(completePeriods.low)}</td>
                    <td>{completePeriods.changeFirstToLast}</td>
                  </>
                )}
                <td>{typeof trend === 'string' ? trend : `${trend.direction} ${trend.change}`}</td>
                <td>{currentPeriodSoFar.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <section className="chart-chat-summary">
      <h2 className="chart-chat-summary-title">Data sent with each message</h2>
      {renderContent()}
    </section>
  );
};

export default ChartChatSummary;
