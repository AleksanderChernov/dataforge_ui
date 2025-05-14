"use client";
import ccxt from "ccxt";
import { useEffect, useState } from "react";
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

export default function CurrencyHistorySelectors() {
  const [exchange, setExchange] = useState("binance");
  const [currency, setCurrency] = useState("");
  const [interval, setInterval] = useState("");
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();

  const handleSubmit = () => {
    console.log({ exchange, currency, interval, fromDate, toDate });
  };

  const disabledStyle = "opacity-50 cursor-not-allowed";
  const fadeIn = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  };

  useEffect(() => {
    (async () => {
      const exchange = new ccxt.binance({
        enableRateLimit: true,
        options: { defaultType: "future" },
      });
      await exchange.loadMarkets();
      const usdtSymbols = Object.values(exchange.markets)
        .filter((m) => m.swap && m.quote === "USDT" && m.active)
        .map((m) => m.symbol);
      const forbidden = new Set([
        "TUSD/USDT",
        "TFUEL/USDT",
        "WIN/USDT",
        "WAN/USDT",
        "EUR/USDT",
        "LTO/USDT",
        "MBL/USDT",
        "DATA/USDT",
        "ARDR/USDT",
        "DCR/USDT",
        "KMD/USDT",
        "LUNA/USDT",
        "UTK/USDT",
        "AUDIO/USDT",
        "JUV/USDT",
        "PSG/USDT",
        "ATM/USDT",
        "DODO/USDT",
        "ACM/USDT",
        "POND/USDT",
        "TKO/USDT",
        "BAR/USDT",
        "SHIB/USDT",
        "FARM/USDT",
        "REQ/USDT",
        "GNO/USDT",
        "XEC/USDT",
        "USDP/USDT",
        "LAZIO/USDT",
        "ADX/USDT",
        "CITY/USDT",
        "QI/USDT",
        "PORTO/USDT",
        "AMP/USDT",
        "PYR/USDT",
        "ALCX/USDT",
        "BTTC/USDT",
        "ACA/USDT",
        "XNO/USDT",
        "BIFI/USDT",
        "NEXO/USDT",
        "LUNC/USDT",
        "OSMO/USDT",
        "GNS/USDT",
        "QKC/USDT",
        "WBTC/USDT",
        "PEPE/USDT",
        "FLOKI/USDT",
        "WBETH/USDT",
        "FDUSD/USDT",
        "IQ/USDT",
        "PIVX/USDT",
        "AEUR/USDT",
        "BONK/USDT",
        "EURI/USDT",
        "SLF/USDT",
        "BNSOL/USDT",
        "XUSD/USDT",
      ]);
      console.log(usdtSymbols)
      const tickers = await exchange.fetchTickers(usdtSymbols);
      console.log(tickers);
    })();
  });

  return (
    <Card className="w-full max-w-xl mx-auto mt-10 p-4 space-y-6 shadow-xl">
      <CardContent className="space-y-4">
        <motion.div {...fadeIn}>
          <Select onValueChange={setExchange} value={exchange}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите биржу" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="binance">Binance</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        <motion.div {...fadeIn}>
          <div className={!exchange ? disabledStyle : ""}>
            <Select
              onValueChange={setCurrency}
              value={currency}
              disabled={!exchange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите валюту" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BTC">BTC</SelectItem>
                <SelectItem value="ETH">ETH</SelectItem>
                <SelectItem value="USDT">USDT</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        <motion.div {...fadeIn}>
          <div className={!currency ? disabledStyle : ""}>
            <Select
              onValueChange={setInterval}
              value={interval}
              disabled={!currency}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите интервал" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">1 минута</SelectItem>
                <SelectItem value="1h">1 час</SelectItem>
                <SelectItem value="1d">1 день</SelectItem>
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
                disabled={!interval}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm mb-1">По дату:</span>
              <Calendar
                mode="single"
                selected={toDate}
                onSelect={setToDate}
                disabled={!interval}
              />
            </div>
          </div>
        </motion.div>

        <motion.div {...fadeIn}>
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={
              !exchange || !currency || !interval || !fromDate || !toDate
            }
          >
            Запросить данные
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
}
