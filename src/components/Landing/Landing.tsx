import Link from "next/link";
import { CryptoHistory } from "../CryptoHistoryInterface";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import Image from "next/image";

export default function Landing() {
  const cards = [
    {
      title: "Fast analysis",
      desc: "AI Market reaction",
    },
    {
      title: "AI-signals",
      desc: "Smart forecasts based on Machine Learning",
    },
  ];

  return (
    <div className="text-white">
      <CryptoHistory />
      <section className="py-24 px-6 text-center max-w-5xl mx-auto bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl shadow-lg border border-white/10 fade-in-start animate-fade-in-delay-1">
        <h1 className="text-5xl font-bold tracking-tight mb-4 fade-in-start animate-fade-in-delay-1">
          Turn your trading to strategy with us
        </h1>
        <p className="text-xl text-gray-300 mb-6 fade-in-start animate-fade-in-delay-2">
          Trading tools built on data and speed
        </p>
        {/* Will be added, when DB is done */}
        {/* <div className="flex justify-center gap-4 fade-in-start animate-fade-in-delay-3">
          <WaitingList />
        </div> */}
        <div className="flex justify-center items-center gap-4 fade-in-start animate-fade-in-delay-3">
          <h3 className="max-w-xl text-3xl p-12 tracking-tight mb-4 fade-in-start animate-fade-in-delay-1 text-center bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl border border-white/10">
            <Link
              href={"https://thevibe.trading/"}
              className="flex flex-col justify-center items-center "
            >
              Come and check out our main product! An LLM trained on trading
              data.
              <Image
              className="mt-8"
                width={183}
                height={36}
                src={"/thevibetrading_logo.png"}
                alt={"The Vibe Trading Logo"}
              />
            </Link>
          </h3>
        </div>
      </section>
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card, index) => (
            <Card
              key={index}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md text-white border border-white/10 shadow-lg animate-fade-in-delay-2"
              style={{ animationDelay: `${index * 0.4}s` }}
            >
              <CardHeader>
                <CardTitle>{card.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300">{card.desc}</CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
