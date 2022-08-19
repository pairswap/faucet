import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

import closeIcon from '../images/close.png';

function Modal({ title, open, onClose, children }) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="dialog" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="dialog__enter"
          enterFrom="dialog__hidden"
          enterTo="dialog__visible"
          leave="dialog__leave"
          leaveFrom="dialog__visible"
          leaveTo="dialog__hidden"
        >
          <Dialog.Overlay className="dialog__overlay" />
        </Transition.Child>
        <Transition.Child
          as={Fragment}
          enter="dialog__enter"
          enterFrom="dialog__hidden"
          enterTo="dialog__visible"
          leave="dialog__leave"
          leaveFrom="dialog__visible"
          leaveTo="dialog__hidden"
        >
          <section className="dialog__content">
            {title ? (
              <section className="dialog__header">
                <h2 className="dialog__title">{title}</h2>
                <button onClick={onClose} className="dialog__close-button">
                  <img src={closeIcon} />
                </button>
              </section>
            ) : null}
            {children}
          </section>
        </Transition.Child>
      </Dialog>
    </Transition.Root>
  );
}

export default Modal;
