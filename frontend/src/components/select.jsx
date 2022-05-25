import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';

import chevronDownIcon from '../images/chevron-down.svg';
import closeIcon from '../images/close.png';
import classname from '../utils/classname';

function Select({ label, dialogLabel, options, onChange }) {
  const [value, setValue] = useState(options[0]);
  const [openOption, setOpenOption] = useState(false);

  useEffect(() => {
    if (value) {
      onChange(value.value);
    }
  }, [value]);

  return (
    <section className="select-container">
      <label className="select-label">{label}</label>
      <button onClick={() => setOpenOption(true)} className="select">
        <article className="select__value">
          <img src={value.image} className="select__value-image" />
          <span className="select__value-text">{value.label}</span>
        </article>
        <img src={chevronDownIcon} />
        <Transition.Root show={openOption} as={Fragment}>
          <Dialog as="div" className="dialog" onClose={() => setOpenOption(false)}>
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
                <section className="dialog__header">
                  <h2 className="dialog__title">{dialogLabel}</h2>
                  <button className="dialog__close-button">
                    <img src={closeIcon} />
                  </button>
                </section>
                {options.map((option) => (
                  <button
                    key={option.label}
                    className={classname(
                      'dialog__option',
                      option.label === value.label && 'dialog__option--active'
                    )}
                    onClick={() => {
                      setValue(option);
                      setOpenOption(false);
                    }}
                  >
                    <img src={option.image} className="dialog__option-image" />
                    <span className="dialog__option-text">{option.label}</span>
                  </button>
                ))}
              </section>
            </Transition.Child>
          </Dialog>
        </Transition.Root>
      </button>
    </section>
  );
}

export default Select;
