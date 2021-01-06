import fetch from 'node-fetch';
import config from './config';

const defaultHeaders = {
  Accepts: 'application/json',
  'Content-Type': 'application/json',
};

export async function get(path: string, headers: Object = {}) {
  try {
    const url = `${config.apiUrl}${path}`;
    const options = {
      method: 'GET',
      headers: {...defaultHeaders, ...headers},
    };
    return fetch(url, options).then(res => res.json());
  } catch (err) {
    console.error(err);
  }
};

export async function post(path: string, body: Object = {}, headers: Object = {}) {
  try {
    const url = `${config.apiUrl}${path}`;
    const options = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {...defaultHeaders, ...headers},
    };
    return fetch(url, options).then(res => res.json());
  } catch (err) {
    console.error(err);
  }
};
