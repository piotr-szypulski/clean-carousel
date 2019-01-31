import React from 'react';
import PropTypes from 'prop-types';
import hash from 'hash-it';
import './style.scss';

const defaults = {
  dot: (<span className="clean-carousel__dot">●</span>),
  dotActive: (<span className="clean-carousel__dot-active">●</span>),
};

/**
 * Component displays dots that represent available images. The currently displayed image is
 * highlighted in different color. When onClickHandler is provided, dots become clickable and
 * reposition the carousel on specific image.
 * @param {object} props - props object contains settings for the component
 */
const Dots = ({
  currentItemIndex,
  dot,
  dotActive,
  onClickHandler,
  nodes,
}) => {
  const Dot = (onClickHandler) ? 'button' : 'div';

  return (
    <div className="clean-carousel__dots">
      {nodes.map((node, index) => (
        <Dot
          className="clean-carousel__dot-wrapper"
          key={hash({ index })}
          onClick={onClickHandler}
          role={onClickHandler ? 'button' : null}
        >
          {
            currentItemIndex === index
              ? dotActive
              : dot
          }
        </Dot>
      ))}
    </div>
  );
};

Dots.defaultProps = {
  dot: defaults.dot,
  dotActive: defaults.dotActive,
  onClickHandler: null,
};

Dots.propTypes = {
  currentItemIndex: PropTypes.number.isRequired,
  dot: PropTypes.element,
  dotActive: PropTypes.element,
  onClickHandler: PropTypes.func,
  nodes: PropTypes.arrayOf(PropTypes.element).isRequired,
};

export default Dots;
