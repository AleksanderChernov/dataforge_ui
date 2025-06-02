import CryptoHistorySelectors from "@/components/CryptoHistoryInterface/CryptoHistorySelectors";
import Head from "next/head";

export default function CryptoHistory() {
  return (
    <>
      <Head>
        <title>Download Crypto History Data | DataForge UI</title>
        <meta
          name="description"
          content="Download historical cryptocurrency OHLCV data from Binance in CSV format. Analyze crypto trends with ease."
        />
        <meta
          name="keywords"
          content="crypto historical data, binance ohlcv, download crypto csv"
        />
      </Head>
      <section className="flex flex-col py-20 px-6 max-w-6xl mx-auto fade-in-start animate-fade-in-delay-1">
        <h2 className="text-3xl font-bold mb-6 text-center">
          Get Binance Candlestick History
        </h2>
        <CryptoHistorySelectors />
      </section>
    </>
  );
}
