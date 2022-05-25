require('dotenv').config();
const express = require('express');
const { body, validationResult } = require('express-validator');
const bodyParser = require('body-parser');
const cors = require('cors');
const { ethers } = require('ethers');
const config = require('./config');
const abi = require('./abi/SampleERC20.json');
const { verify } = require('./utils/captcha');
const { exceededETHBalance, exceedLimitToken } = require('./utils/validation');

const MAX_ETH = '1.0';
const MAX_ERC20 = '50.0';

const ethPerRequest = ethers.utils.parseEther('0.5');
const tokenPerRequest = ethers.utils.parseEther('25.0');
const app = express();

app.use(bodyParser.json());
app.use(cors());

app.post(
  '/faucet',
  body('account')
    .isString()
    .notEmpty()
    .custom((value) => ethers.utils.isAddress(value)),
  body('chainName').isString().notEmpty().isIn(['ganache1', 'ganache2']),
  body('tokenName')
    .isString()
    .notEmpty()
    .isIn(['ETH', 'TIGER', 'KANGAROO', 'MOUSE', 'MONKEY', 'BUNNY']),
  body('signature').isString().notEmpty(),
  async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).send({
        message: 'Invalid value',
        params: errors.array().map((error) => error.param),
      });
    }

    const { account, chainName, tokenName, signature } = req.body;

    const isHuman = await verify(signature);

    if (!isHuman) {
      res.status(400).send({ message: 'Invalid value', params: ['signature'] });
    }

    const { rpcUrl, chainId, tokens } = config[chainName];

    const provider = new ethers.providers.JsonRpcProvider(rpcUrl, chainId);
    const wallet = ethers.Wallet.fromMnemonic(process.env.MNEMOMIC);
    const signer = wallet.connect(provider);

    if (tokenName === 'ETH') {
      const exceeded = await exceededETHBalance({
        account,
        provider,
        limit: MAX_ETH,
      });

      if (exceeded) {
        res.status(400).send({ message: 'Exceeded limit' });
        return;
      }

      const tx = await signer.sendTransaction({
        to: account,
        value: ethPerRequest,
      });
      console.log({ account, hash: tx.hash });
      res.send({ hash: tx.hash });
    } else {
      const contractAddress = tokens[tokenName];
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const exceeded = await exceedLimitToken({
        account,
        contract,
        limit: MAX_ERC20,
      });

      if (exceeded) {
        res.status(400).send({ message: 'Exceeded limit' });
      }

      const tx = await contract.transfer(account, tokenPerRequest);
      console.log({ account, hash: tx.hash });
      res.send({ hash: tx.hash });
    }
  }
);

app.listen(4001, () => console.log('Server is listening on http://localhost:4001'));
