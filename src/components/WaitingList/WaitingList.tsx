import { Button } from "../ui/button";
import { Input } from "../ui/input";

export default function WaitingList() {
  return (
    <section className="py-20 px-6 text-center max-w-2xl mx-auto bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl border border-white/10 fade-in-start animate-fade-in-delay-3">
      <h2 className="text-4xl font-bold mb-4">
        Начни торговать умнее уже сегодня
      </h2>
      <p className="text-gray-300 mb-6">
         Присоединяйтесь к нам, протестируйте новый функционал когда он выйдет
      </p>
      <div className="flex justify-center gap-4">
        <Input
          placeholder="Введи email"
          className="max-w-xs bg-gray-800 text-white placeholder-gray-400"
        />
        <Button>Я готов</Button>
      </div>
    </section>
  );
}
