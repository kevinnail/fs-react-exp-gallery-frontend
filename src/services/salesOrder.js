export const getOrderItems = (order) => (Array.isArray(order?.items) ? order.items : []);

export const getOrderItemsSubtotal = (order) =>
  getOrderItems(order).reduce((runningTotal, item) => runningTotal + (Number(item.price) || 0), 0);

export const getOrderShipping = (order) => Number(order?.shipping_cost) || 0;

export const getOrderTotal = (order) => getOrderItemsSubtotal(order) + getOrderShipping(order);

export const describeOrderPieces = (order) => {
  const items = getOrderItems(order);
  if (items.length === 0) return `Order #${order?.id}`;
  if (items.length === 1) return items[0].post_title || `Post #${items[0].post_id}`;
  return items.map((item) => item.post_title || `Post #${item.post_id}`).join(', ');
};
