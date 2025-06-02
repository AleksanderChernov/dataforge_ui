## Getting Started

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Description

A simple landing page with some selectors that let you choose params to get results from [fetchOHLCV](https://docs.ccxt.com/#/exchanges/binance?id=fetchohlcv) cctx method. The results for 'Symbols' are then turned into .csv files which we later archive and return to user for use in trading software.

Dataforge is a small utility for loading exchange data, making it easier to experiment with market history.

The default Next.js favicon has been replaced with a minimal 'DF' icon defined in `src/app/icon.svg`.

## TODO

- Stricter typing
- Fix TODO's that are still left in code
- Better (flashier?) UI
- Remember user's previous request params and ask if they want to get info for a previous week
- Time intervals requre stricter logic (i.e. user shouldn't be able to select 1 month timeframe and select only a single day in date selectors)
