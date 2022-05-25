import axios from 'axios';

const request = axios.create({
  baseURL: 'http://localhost:4001',
});

export function requestToken({ account, chainName, tokenName, signature }) {
  return request.post('/faucet', { account, chainName, tokenName, signature });
}
