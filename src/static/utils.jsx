/**
 * Generates random color in hex.
 */
export const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  const color = new Array(6)
    .fill(null)
    .map(() => letters[Math.floor(Math.random() * 16)]);

  return `#${color.join('')}`;
};

/**
 * Calculates the width of a DOM element.
 * @param {element} element - DOM element to be measured
 * @param {boolean} withMargin - should margins be included in calculations
 */
export const nodeWidth = (element, withMargin = true) => {
  const style = element.currentStyle || window.getComputedStyle(element);
  const width = element.offsetWidth;

  const margin = (withMargin)
    ? parseFloat(style.marginLeft) + parseFloat(style.marginRight)
    : 0;

  const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
  const border = parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);

  return (width + margin - padding + border);
};

/**
 * Calculates the height of a DOM element.
 * @param {element} element - DOM element to be measured
 * @param {boolean} withMargin - should margins be included in calculations
 */
export const nodeHeight = (element, withMargin = true) => {
  const style = element.currentStyle || window.getComputedStyle(element);
  const height = element.offsetHeight;

  const margin = (withMargin)
    ? parseFloat(style.marginTop) + parseFloat(style.marginBottom)
    : 0;

  const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
  const border = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);

  return (height + margin - padding + border);
};

/**
 * Simple throttle function used in mouse move handler to limit render calls to a preset FPS number,
 * instead of triggering it each time event triggers.
 * @param {number} fps - maximum number of function calls per second
 * @param {Function} func - function to be throttled
 */
export const throttle = (fps = 30, func) => {
  if (this.frameThrottle.startTime) {
    this.frameThrottle.then = window.performance.now();
    this.frameThrottle.startTime = this.frameThrottle.then;
  }

  this.frameThrottle.now = window.performance.now();
  this.frameThrottle.elapsed = this.frameThrottle.now - this.frameThrottle.then;

  const { elapsed, now } = this.frameThrottle;
  const fpsInterval = 1000 / fps;

  if (elapsed > fpsInterval) {
    this.frameThrottle.then = now - (elapsed % fpsInterval);
    func();
  }
};

export const toArray = element => (
  (element instanceof Array)
    ? element
    : [element]
);
