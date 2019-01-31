import React, { createRef, PureComponent } from 'react';
import PropTypes from 'prop-types';
import hash from 'hash-it';
import classNames from 'classnames';
import Arrow from 'Components/arrow';
import Dots from 'Components/dots';
import {
  nodeHeight,
  nodeWidth,
  throttle,
  toArray,
} from 'Static/utils';
import defaults from './defaults.json';
import './style.scss';

class Carousel extends PureComponent {
  constructor(props) {
    super(props);

    const { children } = props;
    this.addEventListeners();

    this.childrenCollection = toArray(children);
    this.mouseTracking = defaults.mouseTracking;
    this.frameThrottle = defaults.frameThrottle;

    this.state = {
      currentItemIndex: null,
      offset: 0,
    };

    this.arrowRefs = {
      left: createRef(),
      right: createRef(),
    };
    this.childrenRefs = this.childrenCollection.map(() => createRef());
    this.groupRef = createRef();
    this.visibleAreaRef = createRef();
  }

  /**
   * When component is mounted we get access to DOM elements, so we can acquire detailed information
   * about item sizes, visible area size, we can calculate boundry to prevent empty space after
   * scrolling to far to the right. We also set the starting position that was set in props.
  */
  componentDidMount() {
    const offsets = this.getOffsets();

    const { startingItemIndex } = this.props;
    const { rightBoundry } = this.mouseTracking;

    const currentItemIndex = (startingItemIndex > rightBoundry)
      ? rightBoundry
      : startingItemIndex;

    const currentOffset = offsets[currentItemIndex].offset;

    this.setState({
      currentItemIndex,
      currentOffset,
      offsets,
    }, this.animate(currentOffset));
  }

  componentDidUpdate() {
    const { speed } = this.props;
    const { currentOffset } = this.state;

    if (this.mouseTracking.isDown) {
      this.animate(currentOffset);
    }

    if (this.shouldSnap) {
      this.animate(currentOffset, speed);
      this.shouldSnap = false;
    }
  }

  componentWillUnmount() {
    this.removeEventListeners();
  }

  /**
   * Calculates offsets required to 
   * @param {array} children - an array of refs to DOM elements in carousel
   * @param {refObject} visibleArea - ref to visible area
   * @param {string} layout - layout version (horizontal or vertical)
   * @param {boolean} infinite - set to true if the scroll is set to infinite
   */
  getOffsets = (children, visibleArea, layout, alignment, infinite) => {
    const visibleAreaSize = this.calculateNodeSize(layout, visibleArea);

    const childrenTotalSize = children
      .reduce((sum, child) => sum + this.calculateNodeSize(layout, child), 0);

    const rightOffsetLimit = visibleAreaSize - childrenTotalSize;

    const offsets = [];
    children
      .reduce((offset, child, index) => {
        if ((offset >= rightOffsetLimit) || infinite) {
          offsets.push({
            index,
            offset,
          });
        }
        return offset - this.calculateNodeSize(layout, child);
      }, 0);

    const lastOffset = offsets[offsets.length - 1];

    if (!infinite && lastOffset.index !== rightOffsetLimit) {
      lastOffset.index = children.length - 1;
      lastOffset.offset = rightOffsetLimit;
    }

    this.mouseTracking.rightBoundry = lastOffset.index;
    return offsets;
  }

  /**
   * Gets the current mouse X or Y depending on the provided layout direction.
   * @param {SyntheticMouseEvent<HTMLButtonElement>} event
   * @param {string} direction - whether layout is horizontal or vertical
   */
  getMousePosition = (event, direction) => (
    (direction === 'horizontal')
      ? event.clientX
      : event.clientY
  );

  /**
   * Add mouse and touch event listeners to carousel element.
   */
  addEventListeners = () => {
    window.addEventListener('mousemove', this.handleMove);
    window.addEventListener('mouseup', this.handleUp);
    window.addEventListener('touchmove', this.handleMove);
    window.addEventListener('touchend', this.handleUp);
  }

  /**
   * Use CSS transition and transform to animate slider.
   * @param {number} position
   * @param {number} speed
   */
  animate = (position, speed) => {
    this.groupRef.current.style.webkitTransition = (speed)
      ? `${speed}s ease-in-out`
      : 'none';
    this.groupRef.current.style.transform = `translateX(${position}px)`;
  }

  /**
   * Calculates offset needed to set item at index on the left edge of the screen.
   * @param {number} index
   */
  calculateOffsetByIndex = (index) => {
    const { rightBoundry } = this.mouseTracking;
    if (rightBoundry && index >= rightBoundry.index) return rightBoundry.offset;
    const offset = this.itemSizes.reduce((sum, item, currentIndex) => {
      if (currentIndex >= index) return sum;
      return sum + item;
    }, 0);

    return -offset;
  };

  /**
   * Calculates offset needed to set item on the left/right of the item at index to the left edge of
   * the screen.
   * @param {number} index
   * @param {number} directionNum - 1: left, -1:right
   */
  calculateOffsetByOne = (index, directionNum) => {
    const offsetIndex = (directionNum === 1) ? 0 : -1;
    return this.itemSizes[index + offsetIndex] * directionNum;
  };

  /**
   * This feature allows us to block slider from scrolling items outside of view. Function returns
   * largest possible offset that displays last item at the right edge of the slider.
   * @param {Array<number>} itemSizes
   * @param {number} visibleAreaSize
   */
  CalculateOffsetLimit = (itemSizes, visibleAreaSize) => {
    /**
     * Reduce returns an object containing the index of the first visible item on the left, when the
     * right boundry limit is applied and an offset required to make the last item on the list stick
     * to the right edge of the parent div.
     */
    const offset = itemSizes
      .reduceRight((result, itemSize, i) => {
        if (result.amount < 0) {
          return result;
        }

        const currentOffset = result.amount - itemSize;
        if (currentOffset < 0) {
          return { index: i + 1, amount: currentOffset };
        }

        if (currentOffset === 0) {
          return { index: i, amount: 0 };
        }

        return { index: result.index, amount: currentOffset };
      }, { index: 0, amount: visibleAreaSize });

    return {
      index: offset.index,
      offset: this.calculateOffsetByIndex(offset.index - 1) + offset.amount,
    };
  };

  calculateNodeSize = (layout, node) => (
    (layout === 'horizontal')
      ? nodeWidth(node.current)
      : nodeHeight(node.current)
  );

  /**
   * Calculate all node sizes.
   * @param {string} direction - horizontal or vertical depending on current layout
   * @param {Array<Object>} nodes
   */
  calculateNodeSizes = (direction, nodes) => (
    nodes.map(node => (
      (direction === 'horizontal')
        ? nodeWidth(node.current)
        : nodeHeight(node.current)
    ))
  );

  /**
   * Calculate selected node size.
   * @param {string} direction - horizontal or vertical depending on current layout
   * @param {Object} node
   */
  calculateSingleNodeSize = (direction, node) => (
    (direction === 'horizontal')
      ? nodeWidth(node, true)
      : nodeHeight(node, true)
  );

  handleArrowClick = (direction) => {
    const { speed } = this.props;
    const { currentItemIndex, offsets } = this.state;
    const { rightBoundry } = this.mouseTracking;

    const nextItemIndex = (direction === 'right')
      ? currentItemIndex + 1
      : currentItemIndex - 1;

    if (nextItemIndex < 0 || nextItemIndex > rightBoundry) return;

    console.log(currentItemIndex, nextItemIndex, offsets);

    const currentOffset = offsets[nextItemIndex].offset;

    this.setState({
      currentItemIndex: offsets[nextItemIndex].index,
      currentOffset,
    }, this.animate(currentOffset, speed));
  }

  handleDown = (event) => {
    event.preventDefault();

    const { offset } = this.state;
    const { direction } = this.props;

    this.mouseTracking.isDown = true;
    this.mouseTracking.downPosition = this.getMousePosition(event, direction);
    this.mouseTracking.groupPosition = offset;
  };

  handleUp = (event) => {
    event.preventDefault();

    const { currentItemIndex } = this.state;
    const { currentPosition, downPosition } = this.mouseTracking;

    // If there was no move event, end here to prevent unnecessary calculations.
    this.mouseTracking.isDown = false;
    if (currentPosition === 0) return;

    const offset = downPosition - currentPosition;

    this.snapToGrid(currentItemIndex, offset);
    this.mouseTracking.currentPosition = 0;
  };

  handleMove = (event) => {
    event.preventDefault();

    const {
      currentPosition,
      downPosition,
      groupPosition,
      isDown,
    } = this.mouseTracking;

    const { direction } = this.props;

    if (!isDown) return;

    const newPosition = this.getMousePosition(event, direction);
    const offset = (currentPosition !== 0)
      ? currentPosition - newPosition
      : 0;

    this.mouseTracking.currentPosition = newPosition;

    if (offset === 0) return;

    throttle(this.frameThrottle.fps, () => {
      this.setState({
        offset: groupPosition - (downPosition - currentPosition),
      });
    });
  }

  removeEventListeners = () => {
    window.removeEventListener('mousemove', this.handleMove);
    window.removeEventListener('mouseup', this.handleUp);
    window.removeEventListener('touchmove', this.handleMove);
    window.removeEventListener('touchend', this.handleUp);
  }

  /**
   * Forces items to always snap to the edges of the visible area. It has hard coded limit to always
   * slide at least one item, no matter how small the drag was. When the drag is longer, if an item
   * on the edge is mostly visible it will snap to that item, if not it will snap to the item before
   * it.
   * @param {number} previousIndex
   * @param {number} offset
   */
  snapToGrid = (previousIndex, offset) => {
    let currentOffset = offset;
    let previousOffset = null;
    let currentIndex = previousIndex;

    if (offset < 0) {
      for (let i = previousIndex - 1; i >= 0; i -= 1) {
        previousOffset = currentOffset;
        currentOffset += this.itemSizes[i];

        if (currentOffset >= 0) {
          currentIndex = (currentOffset < Math.abs(previousOffset) || i === previousIndex - 1)
            ? i
            : i + 1;
          break;
        }
        if (i === 0) currentIndex = 0;
      }
    } else if (offset > 0) {
      for (let i = previousIndex, max = this.itemSizes.length - 1; i <= max; i += 1) {
        previousOffset = currentOffset;
        currentOffset -= this.itemSizes[i];

        if (currentOffset <= 0) {
          currentIndex = (Math.abs(currentOffset) < previousOffset || i === previousIndex)
            ? i + 1
            : i;
          break;
        }
        if (i === max) currentIndex = max;
      }
    }

    this.shouldSnap = true;

    const { rightBoundry: { firstVisibleIndex, offset: maxOffset } } = this.mouseTracking;

    const state = (currentIndex > firstVisibleIndex)
      ? {
        offset: maxOffset,
        currentItemIndex: firstVisibleIndex,
      } : {
        offset: this.calculateOffsetByIndex(currentIndex),
        currentItemIndex: currentIndex,
      };

    this.setState(state);
  }

  render() {
    const { currentItemIndex, offsets } = this.state;
    const { arrows, device, dots } = this.props;
    const { rightBoundry } = this.mouseTracking;

    return (
      <div
        className={`clean-carousel clean-carousel--${device}`}
        ref={this.visibleAreaRef}
      >
        {arrows && offsets
          && [
            <Arrow
              direction="right"
              disabled={currentItemIndex === rightBoundry}
              key="arrow-right"
              onClickHandler={() => this.handleArrowClick('right')}
            />,
            <Arrow
              direction="left"
              disabled={currentItemIndex === 0}
              key="arrow-left"
              onClickHandler={() => this.handleArrowClick('left')}
            />,
          ]
        }
        {!Number.isNaN(currentItemIndex) && dots
          && (
            <Dots
              currentItemIndex={currentItemIndex}
              dot={dots.dot}
              dotActive={dots.dotActive}
              nodes={this.childrenCollection}
            />
          )
        }
        <div
          className="clean-carousel__group"
          ref={this.groupRef}
          role="button"
          tabIndex={0}
        >
          { this.childrenCollection.map((child, index) => React
            .cloneElement(
              child,
              {
                ref: this.childrenRefs[index],
                key: hash(child),
              },
            ))
          }
        </div>
      </div>
    );
  }
}

Carousel.defaultProps = {
  arrows: true,
  dots: true,
  infinite: false,
  layout: 'horizontal',
  speed: 0.2,
};

Carousel.propTypes = {
  arrows: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.element,
  ]),
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  device: PropTypes.string.isRequired,
  dots: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.element,
  ]),
  infinite: PropTypes.bool,
  layout: PropTypes.string,
  speed: PropTypes.number,
  startingItemIndex: PropTypes.number.isRequired,
};

export default Carousel;
