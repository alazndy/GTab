import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';

// Polyfill localStorage for node environment
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
  length: 0,
  key: () => null
} as Storage;

const start = performance.now();
for (let i = 0; i < 1000; i++) {
  renderToString(<App />);
}
const end = performance.now();
console.log(`Render time for 1000 iterations: ${(end - start).toFixed(2)}ms`);
