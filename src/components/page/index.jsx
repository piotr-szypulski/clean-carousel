import React from 'react';
import Carousel from 'Components/carousel';
import hash from 'hash-it';
import { getRandomColor } from '../../static/utils';
import './style.scss';

const itemGenerator = number => new Array(number)
  .fill(null)
  .map((item, index) => {
    const style = {
      backgroundColor: getRandomColor(),
      height: Math.floor(Math.random() * 400) + 200,
      width: Math.floor(Math.random() * 400) + 200,
    };

    return (
      <div
        className="carousel-wrapper__item"
        key={hash(index)}
        style={style}
      >
        <span>
          {`ITEM ${index}`}
        </span>
      </div>
    );
  });

const Page = () => (
  <div className="carousel-wrapper">
    <Carousel
      device="desktop"
      direction="horizontal"
      startingItemIndex={2}
    >
      {itemGenerator(10)}
    </Carousel>
  </div>
);

export default Page;
