import React, { createRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './style.scss';

const defaultElement = (<span>«</span>);

/**
 * Component displays arrows that allow user to move between elements.
 * @param {object} props - props object contains settings for the component
 */
const Arrow = ({
  className,
  direction,
  disabled,
  element,
  onClickHandler,
}) => {
  const disabledClass = (disabled)
    ? [
      'clean-carousel__arrow--disabled',
      `${className}--disabled`,
    ] : [];

  const classList = classNames(
    'clean-carousel__arrow',
    `clean-carousel__arrow--${direction}`,
    className,
    ...disabledClass,
  );

  const ref = createRef();

  return (
    <button
      className={classList}
      onClick={onClickHandler}
      ref={ref}
      type="button"
    >
      {element}
    </button>
  );
};

Arrow.defaultProps = {
  className: null,
  direction: 'right',
  disabled: false,
  element: defaultElement,
};

Arrow.propTypes = {
  className: PropTypes.string,
  direction: PropTypes.string,
  disabled: PropTypes.bool,
  element: PropTypes.element,
  onClickHandler: PropTypes.func.isRequired,
};

export default Arrow;
