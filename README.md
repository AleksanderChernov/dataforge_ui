## Getting Started

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Description

A simple landing page with some selectors that let you choose params to get results from [fetchOHLCV](https://docs.ccxt.com/#/exchanges/binance?id=fetchohlcv) cctx method. The results for 'Symbols' are then get turned into .csv files which we later archive and return to user for use in trading software.

## Why
The main task was to get acquainted with cctx and trading in general, plus Backend-For-Frontend is a tool I wanted to learn better for a long time after working with Node/NestJs. 
