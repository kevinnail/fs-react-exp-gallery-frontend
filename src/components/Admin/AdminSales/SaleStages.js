import { SALE_STAGE_NAMES, describeStage, getStageTone } from './saleStatus.js';

const SaleStages = ({ completedCount, variant = 'row' }) => {
  const toneClass = `slg-stages--${getStageTone(completedCount)}`;

  if (variant === 'detail') {
    return (
      <div className={`slg-stages slg-stages--detail ${toneClass}`}>
        {SALE_STAGE_NAMES.map((stageName, index) => (
          <div
            key={stageName}
            className={`slg-stage-step${index < completedCount ? ' slg-stage-step--done' : ''}`}
          >
            <span className="slg-stage-bar" />
            <span className="slg-stage-name">{stageName}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <span className={`slg-stages ${toneClass}`}>
      <span className="slg-stage-track" aria-hidden="true">
        {SALE_STAGE_NAMES.map((stageName, index) => (
          <span
            key={stageName}
            className={`slg-stage-bar${index < completedCount ? ' slg-stage-bar--done' : ''}`}
          />
        ))}
      </span>
      <span className="slg-stage-status">{describeStage(completedCount)}</span>
    </span>
  );
};

export default SaleStages;
