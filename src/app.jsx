import { isAddress } from '@ethersproject/address';
import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import ReCAPTCHA from 'react-google-recaptcha';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { PublicKey } from '@solana/web3.js';

import Select from './components/select';
import SuccessModal from './components/success-modal';
import ErrorModal from './components/error-modal';
import logo from './images/logo.svg';
import bnbIcon from './images/bnb.png';
import maticIcon from './images/matic.png';
import ftmIcon from './images/ftm.png';
import avaxIcon from './images/avax.png';
import solIcon from './images/sol.png';
import tigerIcon from './images/tiger.png';
import kangarooIcon from './images/kangaroo.png';
import mouseIcon from './images/mouse.png';
import monkeyIcon from './images/monkey.png';
import bunnyIcon from './images/bunny.png';
import * as api from './utils/api';

const chainNames = {
  'binance-testnet': 'Binance Testnet',
  'polygon-testnet': 'Polygon Testnet',
  'fantom-testnet': 'Fantom Testnet',
  'avaxc-testnet': 'Avalanche Testnet',
  'solana-devnet': 'Solana Devnet',
};

const chains = [
  { label: 'Binance Testnet', value: 'binance-testnet', image: bnbIcon },
  { label: 'Polygon Testnet', value: 'polygon-testnet', image: maticIcon },
  { label: 'Fantom Testnet', value: 'fantom-testnet', image: ftmIcon },
  { label: 'Avalanche Testnet', value: 'avaxc-testnet', image: avaxIcon },
  { label: 'Solana Devnet', value: 'solana-devnet', image: solIcon },
];

const tokens = [
  { label: '25 TIGER', value: 'TIGER', image: tigerIcon },
  { label: '25 KANGAROO', value: 'KANGAROO', image: kangarooIcon },
  { label: '25 MOUSE', value: 'MOUSE', image: mouseIcon },
  { label: '25 MONKEY', value: 'MONKEY', image: monkeyIcon },
  { label: '25 BUNNY', value: 'BUNNY', image: bunnyIcon },
];

const SUPPORTED_CHAINS = [
  'binance-testnet',
  'polygon-testnet',
  'fantom-testnet',
  'avaxc-testnet',
  'solana-devnet',
];

const SUPPORTED_TOKENS = ['TIGER', 'KANGAROO', 'MOUSE', 'MONKEY', 'BUNNY'];

const schema = yup.object({
  account: yup
    .string()
    .required('Account is required')
    .test('isValid', 'Account is invalid', function (value) {
      if (this.parent.chainName === 'solana-devnet') {
        return PublicKey.isOnCurve(new PublicKey(value));
      } else {
        return isAddress(value);
      }
    }),
  chainName: yup
    .string()
    .required('Chain name is required')
    .oneOf(SUPPORTED_CHAINS, 'Unsupported chain'),
  tokenName: yup
    .string()
    .required('Token name is required')
    .oneOf(SUPPORTED_TOKENS, 'Unsupported token'),
  signature: yup.string().required('Signature is required'),
});

function App() {
  const {
    clearErrors,
    formState: { errors },
    handleSubmit,
    register,
    setValue,
  } = useForm({ resolver: yupResolver(schema) });
  const [successTransactions, setSuccessTransactions] = useState(null);
  const [waitingTransactions, setWaitingTransactions] = useState(null);
  const [processingTransactions, setProcessingTransactions] = useState(null);
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const recaptchaRef = useRef();

  function resetCaptcha() {
    setValue('signature', '');
    recaptchaRef.current.reset();
  }

  async function getQueue() {
    try {
      const { data } = await api.getQueue();
      setSuccessTransactions(data.success);
      setWaitingTransactions(data.waiting);
      setProcessingTransactions(data.processing);
    } catch (error) {}
  }

  async function onSubmit(payload) {
    try {
      setPending(true);
      await api.addToQueue(payload);
      setSuccess(true);
    } catch (error) {
      console.error(error);
      setError(error);
    } finally {
      setPending(false);
      resetCaptcha();
    }
  }

  useEffect(() => {
    register('signature');
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      getQueue();
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <header className="header">
        <a href="/" className="nav-link">
          <img src={logo} alt="logo" className="logo" />
          <span className="brand">KO EXCHANGE</span>
        </a>
      </header>
      <main>
        <section className="card">
          <h1 className="title">Testnet faucet</h1>
          <section className="input-group">
            <label htmlFor="wallet" className="label">
              Wallet address
            </label>
            <input
              id="wallet"
              placeholder="Enter your wallet address"
              className="input"
              {...register('account')}
            />
          </section>
          <p className="helper-text">{errors.account?.message}</p>

          <section className="select-group">
            <Select
              label="Chain"
              dialogLabel="Select a chain"
              options={chains}
              onChange={(value) => setValue('chainName', value)}
            />
            <Select
              label="Token"
              dialogLabel="Select a token"
              options={tokens}
              onChange={(value) => setValue('tokenName', value)}
            />
          </section>
          <section className="captcha">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey="6Lf8rxggAAAAAHeFN-lp-CLRLOjJTvu8qi8-Tg2S"
              onChange={(value) => {
                setValue('signature', value);
                clearErrors('signature');
              }}
            />
            <p className="helper-text">{errors.signature?.message}</p>
          </section>

          <button onClick={handleSubmit(onSubmit)} disabled={pending} className="submit-button">
            {pending ? <div className="loader"></div> : <span>Request</span>}
          </button>
        </section>
        {waitingTransactions && waitingTransactions.length > 0 ? (
          <section className="card">
            <p className="heading">Transactions in the queue</p>
            {waitingTransactions.map(({ account, tokenName, chainName }) => (
              <article className="transaction">
                <p className="account">Address: {account}</p>
                <p className="info">Chain: {chainNames[chainName]}</p>
                <p className="info">Token: {tokenName}</p>
              </article>
            ))}
          </section>
        ) : null}
        {processingTransactions && processingTransactions.length > 0 ? (
          <section className="card">
            <p className="heading">Processing transactions</p>
            {processingTransactions.map(({ account, tokenName, chainName }) => (
              <article className="transaction">
                <p className="account">Address: {account}</p>
                <p className="info">Chain: {chainNames[chainName]}</p>
                <p className="info">Token: {tokenName}</p>
              </article>
            ))}
          </section>
        ) : null}
        {successTransactions && successTransactions.length > 0 ? (
          <section className="card">
            <p className="heading">Last 5 successful transactions</p>
            {successTransactions.map(({ account, tokenName, chainName, txHash }) => (
              <article className="transaction">
                <p className="account">Address: {account}</p>
                <p className="info">Chain: {chainNames[chainName]}</p>
                <p className="info">Token: {tokenName}</p>
                <p className="info">Hash: {txHash}</p>
              </article>
            ))}
          </section>
        ) : null}
        <SuccessModal
          open={success}
          onClose={() => {
            setSuccess(false);
            resetCaptcha();
          }}
        />
        <ErrorModal
          error={error}
          onClose={() => {
            setError(null);
            resetCaptcha();
          }}
        />
      </main>
    </>
  );
}

export default App;
