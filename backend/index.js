require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { isAddress } = require('@ethersproject/address');
const { Contract } = require('@ethersproject/contracts');
const { JsonRpcProvider } = require('@ethersproject/providers');
const { parseEther } = require('@ethersproject/units');
const { Wallet } = require('@ethersproject/wallet');
const yup = require('yup');

const abi = require('./abi/SampleERC20.json');
const config = require('./config');
const { verify } = require('./utils/captcha');
const { exceedLimitToken } = require('./utils/web3');
const { TOKEN_PER_REQUEST, SUPPORTED_CHAINS, SUPPORTED_TOKENS } = require('./constants/web3');

const wallet = Wallet.fromMnemonic(process.env.MNEMOMIC);
const tokenPerRequest = parseEther(TOKEN_PER_REQUEST);
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

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

app.post('/faucet', async function (req, res) {
  const { account, chainName, tokenName, signature } = req.body;

  try {
    await schema.validate({ account, chainName, tokenName, signature });
  } catch (error) {
    res.status(400).send(error);
    return;
  }

  const isHuman = await verify(signature);

  if (!isHuman) {
    res.status(400).send({ message: 'Signature is invalid' });
    return;
  }

  const { chainId, rpcUrl } = config.chainInfos[chainName];
  const tokenAddress = config.tokenInfos[tokenName][chainName];

  const provider = new JsonRpcProvider(rpcUrl, chainId);
  const signer = wallet.connect(provider);

  const contract = new Contract(tokenAddress, abi, signer);
  const exceeded = await exceedLimitToken({ account, contract });

  if (exceeded) {
    res.status(400).send({ message: 'Token request reaches the limit' });
    return;
  }

  const tx = await contract.transfer(account, tokenPerRequest);
  console.log({ account, chainName, tokenName, txHash: tx.hash });

  res.send(tx.hash);
});

app.listen(4000, () => console.log('Server is listening on http://localhost:4000'));
