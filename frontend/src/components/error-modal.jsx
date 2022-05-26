import Modal from '../components/modal';
import errorIcon from '../images/error.svg';

const INVALID_VALUE = 'invalid_value';
const EXCEEDED_LIMIT = 'exceeded_limit';

const errorMessages = {
  [INVALID_VALUE]: 'Invalid value(s)',
  [EXCEEDED_LIMIT]: 'Exceeded limit',
};

function ErrorModal({ onClose, error }) {
  const { code } = error ?? {};

  return (
    <Modal open={!!error} onClose={onClose}>
      <section>
        <img src={errorIcon} alt="error" className="dialog-image" />
        <div className="dialog-content__title">{errorMessages[code]}</div>
      </section>
    </Modal>
  );
}

export default ErrorModal;
