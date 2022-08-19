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

app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

const recipients = [];

const queue = async.queue(async (task) => {
  const { contract, account, chainName, tokenName } = task;
  console.log(`Transfering to ${account}`);

  try {
    const tx = await contract.transfer(account, tokenPerRequest);
    await tx.wait();

    console.log({ account, chainName, tokenName, txHash: tx.hash });

    recipients.push({ account, txHash: tx.hash });
    while (recipients.length > config.queueSize) {
      recipients.shift();
    }
  } catch (error) {
    console.log(`Failure: ${account}`);
  }
}, 1);

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
    last: [...recipients],
    current: [...queue],
  });
});

app.post('/queue/add', async function (req, res) {
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

  const provider = new JsonRpcProvider(rpcUrl, chainId);
  const signer = wallet.connect(provider);
  const contract = new Contract(tokenAddress, abi, signer);

  const tokenBalance = await contract.balanceOf(account);
  if (
    Number(formatEther(tokenBalance)) + Number(config.tokenPerRequest) >=
    Number(config.maxToken)
  ) {
    return res.status(400).send({ message: 'Token request reaches the limit' });
  }

  if (queue.length() >= config.queueSize) {
    return res.status(400).send({
      message: 'Queue is full. Try again later.',
    });
  }

  queue.push({ account, contract, chainName, tokenName });

  return res.status(200).send({ message: 'Request added to the queue' });
});

app.listen(4000, () => console.log('Server is listening on http://localhost:4000'));
