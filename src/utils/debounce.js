export default (func, wait, immediate) => {
  let timeout;
  return (...args) => {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(null, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(null, args);
  };
};
