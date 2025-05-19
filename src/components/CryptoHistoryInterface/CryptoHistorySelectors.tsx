"use client";
import ccxt from "ccxt";
import { SetStateAction, useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { fadeIn } from "@/lib/animations";
import { disabledStyle } from "@/lib/styles";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Check, ChevronDown } from "lucide-react";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";

export default function CurrencyHistorySelectors() {
  const exchange = "binance";
  const [interval, setInterval] = useState<string>("");
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [usdtSymbols, setUsdtSymbols] = useState<string[]>([]);
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const [search, setSearch] = useState<string>("");
  const [toDate, setToDate] = useState<Date | undefined>();
  const [loading, setIsLoading] = useState<boolean>(false);
  const [error, setIsError] = useState<string>("");

  const intervals: { value: string; alias: string }[] = [
    { value: "1s", alias: "Секунда" },
    { value: "1m", alias: "Минута" },
    { value: "3m", alias: "3 Минуты" },
    { value: "5m", alias: "5 Минут" },
    { value: "15m", alias: "15 Минут" },
    { value: "30m", alias: "30 Минут" },
    { value: "1h", alias: "1 Час" },
    { value: "2h", alias: "2 Часа" },
    { value: "4h", alias: "4 Часa" },
    { value: "6h", alias: "6 Часов" },
    { value: "8h", alias: "8 Часов" },
    { value: "12h", alias: "12 Часов" },
    { value: "1d", alias: "1 День" },
    { value: "3d", alias: "3 Дня" },
    { value: "1w", alias: "1 Неделя" },
    { value: "1M", alias: "1 Месяц" },
  ];

  const handleSubmit = async () => {
    setIsError("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/download-candles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedSymbols,
          timeframe: "1h",
          from: "2024-01-01T00:00:00Z",
          until: "2024-01-02T00:00:00Z",
        }),
      });
      console.log(res);
      const historyBlob = await res.blob();
      const url = URL.createObjectURL(historyBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ohlcv_data.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.log(error);
      setIsError(
        "Ошибка при запросе истории по символам, попробуйте перезагрузить страницу"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = useMemo(
    () =>
      usdtSymbols.filter((symbol) =>
        symbol.toLowerCase().includes(search.toLowerCase())
      ),
    [search, usdtSymbols]
  );

  const checkForDoubleAndSave = (symbol: string) => {
    if (selectedSymbols.includes(symbol)) {
      setSelectedSymbols(selectedSymbols.filter((s) => s !== symbol));
    } else if (selectedSymbols.length < 5) {
      setSelectedSymbols([...selectedSymbols, symbol]);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    setIsError("");
    (async () => {
      try {
        const exchange = new ccxt.binance({
          enableRateLimit: true,
          options: { defaultType: "perpetual" },
        });
        await exchange.loadMarkets();
        const usdtSymbols = Object.values(exchange.markets)
          .filter(
            (symbol) =>
              symbol.quote === "USDT" &&
              symbol.active &&
              symbol.swap &&
              symbol.info.status === "TRADING"
          )
          .map(({ symbol }) => symbol);
        setUsdtSymbols(usdtSymbols);
      } catch (err) {
        console.error(err);
        setIsError(
          "Ошибка при запросе информации бирж, попробуйте перезагрузить страницу"
        );
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <Card className="w-full max-w-xl mx-auto mt-10 p-4 space-y-6 shadow-xl overflow:hidden">
      {loading ? (
        <h1>Ждем информации с биржи</h1>
      ) : (
        <CardContent className="space-y-4">
          <motion.div {...fadeIn}>
            <div className={!exchange ? disabledStyle : ""}>
              <div className="space-y-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      Выберите до 5 символов
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-2">
                    <Input
                      placeholder="Найти символы"
                      value={search}
                      onChange={(e: {
                        target: { value: SetStateAction<string> };
                      }) => setSearch(e.target.value)}
                      className="mb-2"
                    />
                    <div className="flex flex-col align-items-center justify-center pt-12 max-h-60 overflow-y-auto space-y-1">
                      {filtered.slice(0, 50).map((symbol) => (
                        <div
                          key={symbol}
                          className={cn(
                            "cursor-pointer px-2 py-1 rounded-md flex justify-between",
                            selectedSymbols.includes(symbol) &&
                              "bg-primary text-white"
                          )}
                          onClick={() => checkForDoubleAndSave(symbol)}
                        >
                          <span>{symbol}</span>
                          {selectedSymbols.includes(symbol) && (
                            <Check className="h-4 w-4" />
                          )}
                        </div>
                      ))}
                      {filtered.length === 0 && (
                        <div className="text-muted-foreground px-2">
                          Не найдено
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>

                <div className="flex flex-wrap gap-2">
                  {selectedSymbols.map((symbol) => (
                    <Badge
                      key={symbol}
                      onClick={() => checkForDoubleAndSave(symbol)}
                      className="cursor-pointer p-2"
                      variant="secondary"
                    >
                      {symbol}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div {...fadeIn}>
            <div className={selectedSymbols.length === 0 ? disabledStyle : ""}>
              <Select
                onValueChange={setInterval}
                value={interval}
                disabled={selectedSymbols.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите интервал" />
                </SelectTrigger>
                <SelectContent>
                  {intervals.map(({ value, alias }) => {
                    return (
                      <SelectItem key={value} value={value}>
                        {alias}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          <motion.div {...fadeIn}>
            <div
              className={`flex gap-4 ${
                !interval ? disabledStyle + " pointer-events-none" : ""
              }`}
            >
              <div className="flex flex-col">
                <span className="text-sm mb-1">С даты:</span>
                <Calendar
                  mode="single"
                  selected={fromDate}
                  onSelect={setFromDate}
                  disabled={(day) => day > new Date() || !interval}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm mb-1">По дату:</span>
                <Calendar
                  mode="single"
                  selected={toDate}
                  onSelect={setToDate}
                  disabled={(day) => day > new Date() || !interval}
                />
              </div>
            </div>
          </motion.div>

          <motion.div {...fadeIn}>
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={
                !exchange ||
                !selectedSymbols ||
                !interval ||
                !fromDate ||
                !toDate
              }
            >
              Запросить данные
            </Button>
          </motion.div>
        </CardContent>
      )}
      {error ?? <h1>{error}</h1>}
    </Card>
  );
}
