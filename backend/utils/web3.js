const { formatEther } = require('@ethersproject/units');

const { MAX_ETH, MAX_ERC20, ETH_PER_REQUEST, TOKEN_PER_REQUEST } = require('../constants/web3');

async function exceededETHBalance({ account, provider }) {
  const balance = await provider.getBalance(account);

  return Number(formatEther(balance)) + Number(ETH_PER_REQUEST) > Number(MAX_ETH);
}
async function exceedLimitToken({ account, contract }) {
  const balance = await contract.balanceOf(account);

  return Number(formatEther(balance)) + Number(TOKEN_PER_REQUEST) > Number(MAX_ERC20);
}

module.exports = {
  exceededETHBalance,
  exceedLimitToken,
};
