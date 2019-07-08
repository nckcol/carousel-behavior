import { translate, scale } from './transform';

const makeHyperbola = (power) => (x) => -power / x;

const makeHyperbolaEasing = (power = 1) => {
  const powerRoot = Math.sqrt(power);
  const moveToCenter = translate(-powerRoot, powerRoot);
  const hyperbola = makeHyperbola(power);

  return moveToCenter(hyperbola);
};

const getEasings = (size) => {
  const hyperbolaEasing = makeHyperbolaEasing();
  const scaleStart = scale(-size);
  const scaleEnd = scale(size);

  const makeStartEasing = () => scaleStart(hyperbolaEasing);
  const makeEndEasing = (width) => translate(width, width)(scaleEnd(hyperbolaEasing));

  return [makeStartEasing, makeEndEasing];
};

export default getEasings;
