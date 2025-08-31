'use client';

import { Carousel } from 'components/carousel';
import { ThreeItemGrid } from 'components/grid/three-items';

export default function HomePage() {
  return (
    <>
      <ThreeItemGrid />
      <Carousel />
    </>
  );
}
