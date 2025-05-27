## Getting Started

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Description

A simple landing page with some selectors that let you choose params to get results from [fetchOHLCV](https://docs.ccxt.com/#/exchanges/binance?id=fetchohlcv) cctx method. The results for 'Symbols' are then get turned into .csv files which we later archive and return to user for use in trading software.

## TODO

- Stricter typing
- Fix TODO's that are still left in code
- Better (flashier?) UI
- Remember user's previous request params and ask if they want to get info for a previous week
- Time intervals requre stricter logic (i.e. user shouldn't be able to select 1 month timeframe and select only a single day in date selectors)

## BUG

- Sometimes extracting the files creates Error 0x80070057 yet everything with the files seems normal. Maybe it's the double quotes?
