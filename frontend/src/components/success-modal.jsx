import Modal from '../components/modal';
import successIcon from '../images/success.svg';

function SuccessModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose}>
      <section>
        <img src={successIcon} alt="success" className="dialog-image" />
        <div className="dialog-content__title">Your request has been sent successfully</div>
      </section>
    </Modal>
  );
}

export default SuccessModal;
