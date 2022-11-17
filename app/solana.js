const {
  clusterApiUrl,
  sendAndConfirmTransaction,
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  LAMPORTS_PER_SOL,
} = require('@solana/web3.js');
const {
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddress,
} = require('@solana/spl-token');
const bip39 = require('bip39');

const config = require('./config');

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

async function getSigner() {
  const mnemonic = String(process.env.SOLANA_MNEMOMIC);
  const seed = await bip39.mnemonicToSeed(mnemonic);
  return Keypair.fromSeed(seed.subarray(0, 32));
}

async function requestAirdrop(signer) {
  const signature = await connection.requestAirdrop(signer.publicKey, LAMPORTS_PER_SOL); // 1 SOL

  await connection.confirmTransaction(signature);
}

async function accountExisted(pubkey) {
  let account = await connection.getAccountInfo(pubkey, 'confirmed');
  if (account) {
    return true;
  }

  return false;
}

async function createTokenAccount(mintPubkey, ownerPubkey) {
  const signer = await getSigner();
  let ata = await getAssociatedTokenAddress(mintPubkey, ownerPubkey, true);

  if (await accountExisted(ata)) {
    return ata;
  }

  await requestAirdrop(signer);

  let tx = new Transaction().add(
    createAssociatedTokenAccountInstruction(signer.publicKey, ata, ownerPubkey, mintPubkey)
  );

  await sendAndConfirmTransaction(connection, tx, [signer], {
    skipPreflight: true,
    preflightCommitment: 'confirmed',
    commitment: 'confirmed',
  });

  return ata;
}

async function getTokenBalance(ownerAta) {
  const tokenBalance = await connection.getTokenAccountBalance(ownerAta);
  return tokenBalance.value.uiAmount;
}

async function validate({ account, chainName, tokenName }) {
  const mint = config.tokenInfos[tokenName][chainName];
  const mintPubkey = new PublicKey(mint);
  const ownerPubkey = new PublicKey(account);
  const ownerAta = await createTokenAccount(mintPubkey, ownerPubkey);
  const tokenBalance = await getTokenBalance(ownerAta);

  if (tokenBalance + Number(config.tokenPerRequest) >= Number(config.maxToken)) {
    throw new Error('Your tokens plus the requested tokens must less than 50');
  }
}

async function transfer({ account, chainName, tokenName }) {
  const signer = await getSigner();
  const mint = config.tokenInfos[tokenName][chainName];
  const mintPubkey = new PublicKey(mint);
  const ownerPubkey = new PublicKey(account);
  const srcAta = await getAssociatedTokenAddress(mintPubkey, signer.publicKey, true);
  const destAta = await getAssociatedTokenAddress(mintPubkey, ownerPubkey, true);

  let tx = new Transaction().add(
    createTransferCheckedInstruction(
      srcAta,
      mintPubkey,
      destAta,
      signer.publicKey,
      Number(config.tokenPerRequest) * 1e8,
      8
    )
  );

  const txHash = await sendAndConfirmTransaction(connection, tx, [signer], {
    skipPreflight: true,
    preflightCommitment: 'confirmed',
    commitment: 'confirmed',
  });

  return txHash;
}

module.exports = {
  validate,
  transfer,
};
