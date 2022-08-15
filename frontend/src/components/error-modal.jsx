import Modal from '../components/modal';
import errorIcon from '../images/error.svg';

function ErrorModal({ onClose, error }) {
  return (
    <Modal open={Boolean(error)} onClose={onClose}>
      <section>
        <img src={errorIcon} alt="error" className="dialog-image" />
        <div className="dialog-content__title">{error?.response?.data?.message}</div>
      </section>
    </Modal>
  );
}

export default ErrorModal;
