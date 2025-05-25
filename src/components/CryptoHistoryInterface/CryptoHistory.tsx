import CryptoHistorySelectors from "./CryptoHistorySelectors";

export default function CryptoHistory() {
  return (
    <section className="flex flex-col py-20 px-6 max-w-6xl mx-auto fade-in-start animate-fade-in-delay-1">
      <h2 className="text-3xl font-bold mb-6 text-center">
        Make Binance candles history requests.
      </h2>
      <CryptoHistorySelectors />
    </section>
  );
}
