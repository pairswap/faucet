require('dotenv').config();

const express = require('express');
const { body, validationResult } = require('express-validator');
const bodyParser = require('body-parser');
const cors = require('cors');
const { isAddress } = require('@ethersproject/address');
const { Contract } = require('@ethersproject/contracts');
const { JsonRpcProvider } = require('@ethersproject/providers');
const { parseEther } = require('@ethersproject/units');
const { Wallet } = require('@ethersproject/wallet');

const abi = require('./abi/SampleERC20.json');
const config = require('./config');
const { verify } = require('./utils/captcha');
const { exceededETHBalance, exceedLimitToken } = require('./utils/web3');
const {
  ETH_PER_REQUEST,
  TOKEN_PER_REQUEST,
  SUPPORTED_CHAINS,
  SUPPORTED_TOKENS,
} = require('./constants/web3');
const { INVALID_VALUE, EXCEEDED_LIMIT } = require('./constants/error-code');

const wallet = Wallet.fromMnemonic(process.env.MNEMOMIC);
const ethPerRequest = parseEther(ETH_PER_REQUEST);
const tokenPerRequest = parseEther(TOKEN_PER_REQUEST);
const app = express();

app.use(bodyParser.json());
app.use(cors());

app.post(
  '/faucet',
  body('account')
    .isString()
    .notEmpty()
    .custom((value) => isAddress(value)),
  body('chainName').isString().notEmpty().isIn(SUPPORTED_CHAINS),
  body('tokenName').isString().notEmpty().isIn(SUPPORTED_TOKENS),
  body('signature').isString().notEmpty(),
  async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).send({
        code: INVALID_VALUE,
        params: errors.array().map((error) => error.param),
      });
      return;
    }

    const { account, chainName, tokenName, signature } = req.body;

    const isHuman = await verify(signature);

    if (!isHuman) {
      res.status(400).send({ code: INVALID_VALUE, params: ['signature'] });
      return;
    }

    const { rpcUrl, chainId, tokens } = config[chainName];

    const provider = new JsonRpcProvider(rpcUrl, chainId);
    const signer = wallet.connect(provider);

    if (tokenName === 'ETH') {
      const exceeded = await exceededETHBalance({ account, provider });

      if (exceeded) {
        res.status(400).send({ code: EXCEEDED_LIMIT });
        return;
      }

      const tx = await signer.sendTransaction({
        to: account,
        value: ethPerRequest,
      });

      console.log(`account: ${account} --> hash: ${tx.hash}`);
      res.send({ hash: tx.hash });
    } else {
      const contractAddress = tokens[tokenName];
      const contract = new Contract(contractAddress, abi, signer);
      const exceeded = await exceedLimitToken({ account, contract });

      if (exceeded) {
        res.status(400).send({ code: EXCEEDED_LIMIT });
        return;
      }

      const tx = await contract.transfer(account, tokenPerRequest);

      console.log(`account: ${account} --> hash: ${tx.hash}`);
      res.send({ hash: tx.hash });
    }
  }
);

app.listen(4001, () => console.log('Server is listening on http://localhost:4001'));
