import CryptoHistorySelectors from "./CryptoHistorySelectors";

export default function CryptoHistory() {
  return (
    <section className="py-20 px-6 max-w-6xl mx-auto fade-in-start animate-fade-in-delay-1">
      <h2 className="text-3xl font-bold mb-6 text-center">
        Запрос истории &rdquo;свечей&rdquo; с криптобирж. На данный момент
        работаем с Binance, используя связку &rdquo;USDT&rdquo;.
      </h2>
      <CryptoHistorySelectors />
    </section>
  );
}
