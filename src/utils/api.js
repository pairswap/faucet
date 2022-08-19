import axios from 'axios';

const request = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export function addToQueue({ account, chainName, tokenName, signature }) {
  return request.post('/queue/add', { account, chainName, tokenName, signature });
}

export function getQueue() {
  return request.get('/queue');
}
