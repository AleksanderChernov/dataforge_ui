"use client";
import ccxt from "ccxt";
import { SetStateAction, useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ru } from "date-fns/locale";
import { format } from "date-fns";
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
import { CalendarIcon, Check, ChevronDown } from "lucide-react";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { Loading } from "../Loading";

export default function CurrencyHistorySelectors() {
  const exchange = "binance";
  const [timeframe, setTimeframe] = useState<string>("");
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [usdtSymbols, setUsdtSymbols] = useState<string[]>([]);
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const [search, setSearch] = useState<string>("");
  const [loading, setIsLoading] = useState<boolean>(false);
  const [error, setIsError] = useState<string>("");

  const cctxTimeframes: { value: string; alias: string }[] = [
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
          timeframe,
          from: fromDate,
          until: toDate,
        }),
      });
      console.log(res);
      const historyBlob = await res.blob();
      const url = URL.createObjectURL(historyBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ohlcv_data:${selectedSymbols.join(".")}.zip`;
      link.click();
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
    <Card className="flex flex-col align-items-center justify-center w-full max-w-xl mx-auto mt-10 p-4 space-y-6 shadow-xl min-h-[300px] overflow:hidden">
      {loading ? (
        <Loading />
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
                onValueChange={setTimeframe}
                value={timeframe}
                disabled={selectedSymbols.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите интервал" />
                </SelectTrigger>
                <SelectContent>
                  {cctxTimeframes.map(({ value, alias }) => {
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
              className={cn("flex flex-col gap-4", !timeframe && disabledStyle)}
            >
              <div className="flex flex-col">
                <span className="text-sm mb-2">С даты:</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[280px] justify-start text-left font-normal",
                        !fromDate && "text-muted-foreground"
                      )}
                      disabled={!timeframe}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fromDate ? (
                        format(fromDate, "PPP", { locale: ru })
                      ) : (
                        <span>Выберите дату</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={fromDate}
                      onSelect={setFromDate}
                      disabled={(day) => day > new Date() || !timeframe}
                      locale={ru}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col">
                <span className="text-sm mb-1">По дату:</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[280px] justify-start text-left font-normal",
                        !toDate && "text-muted-foreground"
                      )}
                      disabled={!timeframe || !fromDate}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {toDate ? (
                        format(toDate, "PPP", { locale: ru })
                      ) : (
                        <span>Выберите дату</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={toDate}
                      onSelect={setToDate}
                      disabled={(day) =>
                        day > new Date() || day < fromDate! || !timeframe
                      }
                      locale={ru}
                    />
                  </PopoverContent>
                </Popover>
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
                !timeframe ||
                !fromDate ||
                !toDate
              }
            >
              Запросить данные
            </Button>
          </motion.div>
        </CardContent>
      )}
      {error ?? (
        <div className="flex justify-center align-items-center text-center flex-col h-[500px]">
          <h1 className="text-red">{error}</h1>
        </div>
      )}
    </Card>
  );
}
