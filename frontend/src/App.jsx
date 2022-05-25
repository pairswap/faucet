import { isAddress } from '@ethersproject/address';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import ReCAPTCHA from 'react-google-recaptcha';

import Select from './components/select';
import logo from './images/logo.svg';
import ethIcon from './images/eth.png';
import tigerIcon from './images/tiger.png';
import kangarooIcon from './images/kangaroo.png';
import mouseIcon from './images/mouse.png';
import monkeyIcon from './images/monkey.png';
import bunnyIcon from './images/bunny.png';
import { requestToken } from './utils/request';

const chains = [
  { label: 'KO Chain', value: 'ganache1', image: ethIcon },
  { label: 'Mazze Chain', value: 'ganache2', image: ethIcon },
];

const tokens = [
  { label: '0.5 ETH', value: 'ETH', image: ethIcon },
  { label: '25 TIGER', value: 'TIGER', image: tigerIcon },
  { label: '25 KANGAROO', value: 'KANGAROO', image: kangarooIcon },
  { label: '25 MOUSE', value: 'MOUSE', image: mouseIcon },
  { label: '25 MONKEY', value: 'MONKEY', image: monkeyIcon },
  { label: '25 BUNNY', value: 'BUNNY', image: bunnyIcon },
];

const validationRules = {
  account: {
    required: true,
    validate: (value) => isAddress(value),
  },
  signature: {
    required: true,
  },
};

const errorMessages = {
  account: {
    required: 'Wallet address is required',
    validate: 'Wallet address is invalid',
  },
  signature: {
    required: 'Please verify',
  },
};

function App() {
  const {
    clearErrors,
    formState: { errors },
    handleSubmit,
    register,
    setValue,
  } = useForm({
    defaultValues: {
      account: '',
      chainName: '',
      tokenName: '',
      signature: '',
    },
  });
  const recaptchaRef = useRef();

  async function onSubmit(data) {
    try {
      const response = await requestToken(data);
      recaptchaRef.current.reset();
      setValue('signature', '');
      console.log({ response });
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    register('signature', { required: true });
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
              {...register('account', validationRules.account)}
            />
          </section>
          <p className="helper-text">{errorMessages.account[errors.account?.type]}</p>

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
            <p className="helper-text">{errorMessages.signature[errors.signature?.type]}</p>
          </section>

          <button onClick={handleSubmit(onSubmit)} className="submit-button">
            Request
          </button>
        </section>
      </main>
    </>
  );
}

export default App;
