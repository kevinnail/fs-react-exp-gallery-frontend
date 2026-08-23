export const SALE_STAGE_NAMES = ['Sold', 'Paid', 'Shipped'];

const hasRealTracking = (trackingNumber) =>
  Boolean(trackingNumber) && String(trackingNumber).trim() !== '' && trackingNumber !== '0';

export const countCompletedStages = ({ isPaid, trackingNumber }) => {
  if (isPaid && hasRealTracking(trackingNumber)) return 3;
  if (isPaid) return 2;
  return 1;
};

export const describeStage = (completedCount) => {
  if (completedCount >= 3) return 'Shipped';
  if (completedCount === 2) return 'To ship';
  return 'Unpaid';
};

export const getStageTone = (completedCount) => {
  if (completedCount >= 3) return 'good';
  if (completedCount === 2) return 'wait';
  return 'bad';
};

export { hasRealTracking };
