import { CryptoHistory } from "../CryptoHistoryInterface";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { WaitingList } from "../WaitingList";

export default function Landing() {
  return (
    <div className="text-white">
      <section className="py-24 px-6 text-center max-w-5xl mx-auto bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl shadow-lg border border-white/10 fade-in-start animate-fade-in-delay-0">
        <h1 className="text-5xl font-bold tracking-tight mb-4 fade-in-start animate-fade-in-delay-1">
          Преврати свою торговлю в стратегию с нами
        </h1>
        <p className="text-xl text-gray-300 mb-6 fade-in-start animate-fade-in-delay-2">
          Инструменты для трейдинга, построенные на данных и скорости
        </p>
        <div className="flex justify-center gap-4 fade-in-start animate-fade-in-delay-3">
          <WaitingList />
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Быстрая аналитика",
              desc: "Реакция на рынок от AI",
            },
            {
              title: "AI-сигналы",
              desc: "Умные прогнозы на основе машинного обучения",
            },
            {
              title: "Безопасность",
              desc: "Шифрование и защита",
            },
          ].map((f, i) => (
            <Card
              key={i}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md text-white border border-white/10 shadow-lg animate-fade-in"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              <CardHeader>
                <CardTitle>{f.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300">{f.desc}</CardContent>
            </Card>
          ))}
        </div>
      </section>
      <CryptoHistory />
    </div>
  );
}
