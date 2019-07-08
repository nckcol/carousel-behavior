export const getDistanceSq = (startPoint, endPoint) => {
  const x = endPoint.x - startPoint.x;
  const y = endPoint.y - startPoint.y;
  return x * x + (y * y) / 2;
};

export const getDistance = (startPoint, endPoint) => {
  const x = endPoint.x - startPoint.x;
  const y = endPoint.y - startPoint.y;
  return Math.sqrt(x * x + y * y);
};
