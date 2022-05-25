const { ethers } = require('ethers');

async function exceededETHBalance({ account, provider, limit }) {
  const balance = await provider.getBalance(account);

  return Number(ethers.utils.formatEther(balance)) > Number(limit);
}
async function exceedLimitToken({ account, contract, limit }) {
  const balance = await contract.balanceOf(account);

  return Number(ethers.utils.formatEther(balance)) > Number(limit);
}

module.exports = {
  exceededETHBalance,
  exceedLimitToken,
};
