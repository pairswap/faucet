import Modal from '../components/modal';
import successIcon from '../images/success.svg';

const explorers = {
  'binance-testnet': 'https://testnet.bscscan.com',
  'polygon-testnet': 'https://mumbai.polygonscan.com',
  'fantom-testnet': 'https://testnet.ftmscan.com',
};

function SuccessModal({ chainName, hash, open, onClose }) {
  return (
    <Modal open={open} onClose={onClose}>
      <section>
        <img src={successIcon} alt="success" className="dialog-image" />
        <div className="dialog-content__title">Your request has been sent successfully</div>
        <a
          href={`${explorers[chainName]}/tx/${hash}`}
          target="_blank"
          rel="noreferrer"
          className="dialog-content__text"
        >
          View it on block explorer
        </a>
      </section>
    </Modal>
  );
}

export default SuccessModal;
