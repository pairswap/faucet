const { Contract } = require('@ethersproject/contracts');
const { JsonRpcProvider } = require('@ethersproject/providers');
const { formatEther, parseEther } = require('@ethersproject/units');
const { Wallet } = require('@ethersproject/wallet');

const abi = require('./abi.json');
const config = require('./config');

const tokenPerRequest = parseEther(config.tokenPerRequest);

function getSigner({ chainId, rpcUrl }) {
  const wallet = Wallet.fromMnemonic(process.env.ETHEREUM_MNEMOMIC);
  const provider = new JsonRpcProvider(rpcUrl, chainId);
  return wallet.connect(provider);
}

async function validate({ account, chainName, tokenName }) {
  const tokenAddress = config.tokenInfos[tokenName][chainName];
  const { chainId, rpcUrl } = config.chainInfos[chainName];
  const signer = getSigner({ chainId, rpcUrl });

  const contract = new Contract(tokenAddress, abi, signer);
  const tokenBalance = await contract.balanceOf(account);

  if (
    Number(formatEther(tokenBalance)) + Number(config.tokenPerRequest) >=
    Number(config.maxToken)
  ) {
    throw new Error('Your tokens plus the requested tokens must less than 50');
  }
}

async function transfer({ account, chainName, tokenName }) {
  const tokenAddress = config.tokenInfos[tokenName][chainName];
  const { chainId, rpcUrl } = config.chainInfos[chainName];
  const signer = getSigner({ chainId, rpcUrl });

  const contract = new Contract(tokenAddress, abi, signer);
  const tx = await contract.transfer(account, tokenPerRequest);
  await tx.wait();
  return txHash;
}

module.exports = {
  validate,
  transfer,
};
