import { useState, useEffect } from 'react';

import Modal from '../components/modal';
import chevronDownIcon from '../images/chevron-down.svg';
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
        <Modal title={dialogLabel} open={openOption} onClose={() => setOpenOption(false)}>
          <section>
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
        </Modal>
      </button>
    </section>
  );
}

export default Select;
