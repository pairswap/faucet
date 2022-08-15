import { isAddress } from '@ethersproject/address';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import ReCAPTCHA from 'react-google-recaptcha';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import Select from './components/select';
import SuccessModal from './components/success-modal';
import ErrorModal from './components/error-modal';
import logo from './images/logo.svg';
import bnbIcon from './images/bnb.png';
import maticIcon from './images/matic.png';
import ftmIcon from './images/ftm.png';
import tigerIcon from './images/tiger.png';
import kangarooIcon from './images/kangaroo.png';
import mouseIcon from './images/mouse.png';
import monkeyIcon from './images/monkey.png';
import bunnyIcon from './images/bunny.png';
import { requestToken } from './utils/request';

const chains = [
  { label: 'Binance Testnet', value: 'binance-testnet', image: bnbIcon },
  { label: 'Polyon Testnet', value: 'polygon-testnet', image: maticIcon },
  { label: 'Fantom Testnet', value: 'fantom-testnet', image: ftmIcon },
];

const tokens = [
  { label: '25 TIGER', value: 'TIGER', image: tigerIcon },
  { label: '25 KANGAROO', value: 'KANGAROO', image: kangarooIcon },
  { label: '25 MOUSE', value: 'MOUSE', image: mouseIcon },
  { label: '25 MONKEY', value: 'MONKEY', image: monkeyIcon },
  { label: '25 BUNNY', value: 'BUNNY', image: bunnyIcon },
];

const SUPPORTED_CHAINS = ['binance-testnet', 'polygon-testnet', 'fantom-testnet'];
const SUPPORTED_TOKENS = ['TIGER', 'KANGAROO', 'MOUSE', 'MONKEY', 'BUNNY'];

const schema = yup.object({
  account: yup
    .string()
    .required('Account is required')
    .test('isValid', 'Account is invalid', (value) => isAddress(value)),
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
    getValues,
  } = useForm({ resolver: yupResolver(schema) });
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hash, setHash] = useState(null);
  const [error, setError] = useState(null);
  const recaptchaRef = useRef();
  console.log({ errors });

  const resetCaptcha = useCallback(() => {
    setValue('signature', '');
    recaptchaRef.current.reset();
  }, []);

  const onSubmit = useCallback(async (payload) => {
    try {
      setPending(true);
      const { data } = await requestToken(payload);
      setSuccess(true);
      setHash(data);
    } catch (error) {
      console.error(error);
      setError(error);
    } finally {
      setPending(false);
      resetCaptcha();
    }
  }, []);

  useEffect(() => {
    register('signature');
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

          <SuccessModal
            open={success}
            chainName={getValues('chainName')}
            hash={hash}
            onClose={() => {
              setSuccess(false);
              resetCaptcha();
            }}
          />
          <ErrorModal
            onClose={() => {
              setError(null);
              resetCaptcha();
            }}
            error={error}
          />
        </section>
      </main>
    </>
  );
}

export default App;
