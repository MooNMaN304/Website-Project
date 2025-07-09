'use client';

import Modal from 'components/cart/modal';
import OpenCart from 'components/cart/open-cart';
import { Fragment } from 'react';

export default function CartSection() {
  return (
    <Fragment>
      <OpenCart />
      <Modal />
    </Fragment>
  );
}
