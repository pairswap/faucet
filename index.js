require('dotenv').config();

const async = require('async');
const axios = require('axios');
const cors = require('cors');
const express = require('express');
const yup = require('yup');
const { Contract } = require('@ethersproject/contracts');
const { JsonRpcProvider } = require('@ethersproject/providers');
const { Wallet } = require('@ethersproject/wallet');
const { formatEther, parseEther } = require('@ethersproject/units');
const { isAddress } = require('@ethersproject/address');

const abi = require('./abi.json');
const config = require('./config');

const supportedChains = Object.keys(config.chainInfos);
const supportedTokens = Object.keys(config.tokenInfos);

const wallet = Wallet.fromMnemonic(process.env.MNEMOMIC);
const tokenPerRequest = parseEther(config.tokenPerRequest);
const app = express();
app.enable('trust proxy');
app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

let success = [];
let processing = [];
let queues = {};

function getQueueItems() {
  let items = [];

  Object.values(queues).forEach((queue) => {
    items = [...queue];
  });

  return items;
}

function createQueue() {
  return async.queue(async (task) => {
    const { contract, account, chainName, tokenName } = task;
    console.log(`Transfering to ${account}`);

    try {
      const tx = await contract.transfer(account, tokenPerRequest);
      const info = { account, chainName, tokenName, txHash: tx.hash };
      console.log(info);
      processing.push(info);

      await tx.wait();

      processing = processing.filter(({ txHash }) => txHash !== tx.hash);
      success.push(info);

      while (success.length > 5) {
        success.shift();
      }
    } catch (error) {
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
    .test('isValid', 'Account is invalid', (value) => isAddress(value)),
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
  let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  ip = ip.replace(/\./g, '_');
  console.log(`Adding ${ip} to the queue`);

  const { account, chainName, tokenName, signature } = req.body;

  try {
    await schema.validate({ account, chainName, tokenName, signature });
  } catch (error) {
    return res.status(400).send(error);
  }

  const { data } = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${signature}`
  );

  if (!data.success) {
    return res.status(400).send({ message: 'Signature is invalid' });
  }
  const { chainId, rpcUrl } = config.chainInfos[chainName];
  const tokenAddress = config.tokenInfos[tokenName][chainName];

  try {
    const provider = new JsonRpcProvider(rpcUrl, chainId);
    const signer = wallet.connect(provider);
    const contract = new Contract(tokenAddress, abi, signer);
    const queue = queues[chainName];

    const tokenBalance = await contract.balanceOf(account);
    if (
      Number(formatEther(tokenBalance)) + Number(config.tokenPerRequest) >=
      Number(config.maxToken)
    ) {
      return res
        .status(400)
        .send({ message: 'Your tokens plus the requested tokens must less than 50' });
    }

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

    queue.push({ account, contract, chainName, tokenName });

    return res.status(200).send({ message: 'Request added to the queue' });
  } catch (error) {
    console.error(error);
    return res.status(400).send({
      message: 'An unknown error occurred. Please try again later.',
    });
  }
});

app.listen(4000, () => console.log('Server is listening on http://localhost:4000'));
