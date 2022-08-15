const { formatEther } = require('@ethersproject/units');

const { MAX_ERC20, TOKEN_PER_REQUEST } = require('../constants/web3');

async function exceedLimitToken({ account, contract }) {
  const balance = await contract.balanceOf(account);

  return Number(formatEther(balance)) + Number(TOKEN_PER_REQUEST) >= Number(MAX_ERC20);
}

module.exports = {
  exceedLimitToken,
};
