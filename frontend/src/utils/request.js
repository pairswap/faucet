import axios from 'axios';

const request = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export function requestToken({ account, chainName, tokenName, signature }) {
  return request.post('/faucet', { account, chainName, tokenName, signature });
}
