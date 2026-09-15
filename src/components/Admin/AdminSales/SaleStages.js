import { SALE_STAGE_NAMES, describeStage, getStageTone } from './saleStatus.js';

const SaleStages = ({ completedCount, variant = 'row' }) => {
  const toneClass = `sale-stages--${getStageTone(completedCount)}`;

  if (variant === 'detail') {
    return (
      <div className={`sale-stages sale-stages--detail ${toneClass}`}>
        {SALE_STAGE_NAMES.map((stageName, index) => (
          <div
            key={stageName}
            className={`sale-stages-step${index < completedCount ? ' sale-stages-step--done' : ''}`}
          >
            <span className="sale-stages-bar" />
            <span className="sale-stages-step-name">{stageName}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <span className={`sale-stages ${toneClass}`}>
      <span className="sale-stages-track" aria-hidden="true">
        {SALE_STAGE_NAMES.map((stageName, index) => (
          <span
            key={stageName}
            className={`sale-stages-bar${index < completedCount ? ' sale-stages-bar--done' : ''}`}
          />
        ))}
      </span>
      <span className="sale-stages-status">{describeStage(completedCount)}</span>
    </span>
  );
};

export default SaleStages;
