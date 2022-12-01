require('dotenv').config();

const async = require('async');
const cors = require('cors');
const express = require('express');
const yup = require('yup');
const { isAddress } = require('@ethersproject/address');
const { PublicKey } = require('@solana/web3.js');

const config = require('./app/config');
const captcha = require('./app/captcha');
const ethereum = require('./app/ethereum');
const solana = require('./app/solana');

const supportedChains = Object.keys(config.chainInfos);
const supportedTokens = Object.keys(config.tokenInfos);

const app = express();
app.enable('trust proxy');
app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

let success = [];
let processing = [];
let queues = {};

const providers = {
  'polygon-testnet': ethereum,
  'binance-testnet': ethereum,
  'fantom-testnet': ethereum,
  'avaxc-testnet': ethereum,
  'solana-devnet': solana,
};

function getQueueItems() {
  let items = [];

  Object.values(queues).forEach((queue) => {
    items = [...queue];
  });

  return items;
}

function createQueue() {
  return async.queue(async (task) => {
    const { ip, account, chainName, tokenName } = task;
    console.log(`Pending: ${account}`);
    const info = { ip, account, chainName, tokenName };
    processing.push(info);

    try {
      const txHash = await providers[chainName].transfer({ account, chainName, tokenName });

      processing = processing.filter((p) => p.account !== account);
      success.push({ ...info, txHash });
      console.log(`Success: ${account}`);
      console.log({ ...info, txHash });

      while (success.length > 5) {
        success.shift();
      }
    } catch (error) {
      console.error(error);
      console.log(`Failure: ${account}`);
    }
  }, 1);
}

supportedChains.forEach((chain) => {
  queues[chain] = createQueue();
});

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
    .oneOf(supportedChains, 'Unsupported chain'),
  tokenName: yup
    .string()
    .required('Token name is required')
    .oneOf(supportedTokens, 'Unsupported token'),
  signature: yup.string().required('Signature is required'),
});

app.get('/queue', function (_, res) {
  return res.status(200).json({
    success: [...success],
    waiting: getQueueItems(),
    processing: [...processing],
  });
});

app.post('/queue/add', async function (req, res) {
  const { account, chainName, tokenName, signature } = req.body;

  try {
    await schema.validate({ account, chainName, tokenName, signature });
    await captcha.validate({ signature });
    await providers[chainName].validate({ account, chainName, tokenName });
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }

  try {
    const queue = queues[chainName];

    if (queue.length() >= config.queueSize) {
      return res.status(400).send({
        message: 'Queue is full. Try again later.',
      });
    }

    if (
      [...queue].find((t) => t.account === account) ||
      processing.find((t) => t.account === account)
    ) {
      return res.status(400).send({
        message: 'You have a pending transaction. Try again later.',
      });
    }

    queue.push({
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      account,
      chainName,
      tokenName,
    });

    return res.status(200).send({ message: 'Request added to the queue' });
  } catch (error) {
    return res.status(400).send({
      message: 'An unknown error occurred. Please try again later.',
    });
  }
});

app.listen(4000, () => console.log('Server is listening on http://localhost:4000'));
