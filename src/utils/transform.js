export const scale = (factor) => (f) => (x) => f(x / factor) * factor;

export const translate = (x0, y0) => (f) => (x) => f(x - x0) + y0;
