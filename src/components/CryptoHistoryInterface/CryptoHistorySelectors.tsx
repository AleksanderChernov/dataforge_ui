"use client";
import ccxt, { OHLCV } from "ccxt";
import { useCallback, useEffect, useState } from "react";
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
import { CalendarIcon } from "lucide-react";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { Loading } from "../Loading";
import JSZip from "jszip";
import pLimit from "p-limit";
import FilterPanel from "./FilterPanel";
import SymbolSelector from "./SymbolPanel";
import { Progress } from "@/components/ui/progress";
import { FilterConditions } from "@/lib/types";

export default function CurrencyHistorySelectors() {
  const exchangeId = "binance";
  const [timeframe, setTimeframe] = useState<string>("");
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [allSymbols, setAllSymbols] = useState<string[]>([]);
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [search, setSearch] = useState<string>("");
  const [loading, setIsLoading] = useState<boolean>(false);
  const [error, setIsError] = useState<string>("");
  const [progress, setProgress] = useState(0); // Progress state

  const cctxTimeframes: { value: string; alias: string }[] = [
    { value: "1s", alias: "A Second" },
    { value: "1m", alias: "1 Minute" },
    { value: "3m", alias: "3 Minutes" },
    { value: "5m", alias: "5 Minutes" },
    { value: "15m", alias: "15 Minutes" },
    { value: "30m", alias: "30 Minutes" },
    { value: "1h", alias: "1 Hour" },
    { value: "2h", alias: "2 Hours" },
    { value: "4h", alias: "4 Hours" },
    { value: "6h", alias: "6 Hours" },
    { value: "8h", alias: "8 Hours" },
    { value: "12h", alias: "12 Hours" },
    { value: "1d", alias: "1 Day" },
    { value: "3d", alias: "3 Days" },
    { value: "1w", alias: "1 Week" },
    { value: "1M", alias: "1 Month" },
  ];

  const filterConditions: FilterConditions = [
    {
      label: "Swap",
      addedCheck: (symbol) => symbol.swap,
    },
    {
      label: "Future",
      addedCheck: (symbol) => symbol.future,
    },
    {
      label: "Spot",
      addedCheck: (symbol) => symbol.spot,
    },
    {
      label: "USDT",
      addedCheck: (symbol) => symbol.quote === "USDT",
    },
    {
      label: "Active",
      addedCheck: (symbol) => symbol.active,
    },
    {
      label: "Traded",
      addedCheck: (symbol) => symbol.info.status === "TRADING",
    },
  ];

  const handleSubmit = async () => {
    setIsError("");
    setIsLoading(true);
    setProgress(0);
    try {
      const exchange = new ccxt.binance({
        enableRateLimit: true,
      });
      await exchange.loadMarkets();

      const fromMs = Date.parse(fromDate!.toString());
      const untilMs = Date.parse(toDate!.toString());
      const listOfConcurrentRequests = pLimit(5);
      const totalSymbols = selectedSymbols.length;
      let completedSymbols = 0;

      const csvBuffers = await Promise.all(
        selectedSymbols.map((symbol) =>
          listOfConcurrentRequests(async () => {
            try {
              const allOHLCV: OHLCV[] = [];
              let startSince = fromMs;
              while (startSince < untilMs) {
                const batch = await exchange.fetchOHLCV(
                  symbol,
                  timeframe,
                  startSince,
                  1000
                );

                if (!batch.length) {
                  break;
                }

                allOHLCV.push(...batch);

                const lastTimestamp = batch[batch.length - 1][0];

                if (lastTimestamp && startSince >= lastTimestamp) {
                  console.log("Exchange candles changed, our info is now old");
                  break;
                }

                if (batch.length !== 1000) {
                  break;
                }

                startSince = lastTimestamp! + 1;

                await exchange.sleep(exchange.rateLimit);
              }
              console.log(`We got ${allOHLCV.length} candles for ${symbol}`);
              const csv = [
                "timestamp,open,high,low,close,volume",
                ...allOHLCV.map((row) => row.join(",")),
              ].join("\n");
              completedSymbols++;
              setProgress((completedSymbols / totalSymbols) * 100);
              return {
                filename: symbol + ".csv",
                content: csv,
              };
            } catch (error) {
              setIsError(`Error with ${symbol}: ${error}`);
              return;
            }
          })
        )
      );

      const zip = new JSZip();

      for (const file of csvBuffers) {
        if (file) {
          zip.file(file.filename, file.content);
        }
      }

      zip.generateAsync({ type: "blob" }).then(function (content) {
        const url = URL.createObjectURL(content);
        const link = document.createElement("a");
        link.href = url;
        link.download = `ohlcv_data:${selectedSymbols.join(".")}.zip`;
        link.click();
        URL.revokeObjectURL(url);
        setProgress(0);
      });
    } catch (error) {
      console.log(error);
      setIsError(
        "Received an error while making a symbols history request. Try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const checkForDoubleAndSave = (symbol: string) => {
    if (selectedSymbols.includes(symbol)) {
      setSelectedSymbols(selectedSymbols.filter((s) => s !== symbol));
    } else if (selectedSymbols.length < 5) {
      setSelectedSymbols([...selectedSymbols, symbol]);
    }
  };

  const loadSymbols = useCallback(async () => {
    setIsLoading(true);
    setIsError("");
    try {
      const exchange = new ccxt.binance({
        enableRateLimit: true,
        options: { defaultType: "perpetual" },
      });
      await exchange.loadMarkets();
      const filteredSymbols = Object.values(exchange.markets)
        .filter((symbol) =>
          filterConditions
            .filter((filter) => activeFilters.includes(filter.label))
            .every((filter) => filter.addedCheck(symbol))
        )
        .map(({ symbol }) => symbol);
      console.log(Object.values(exchange.markets));
      console.log(filteredSymbols);
      setAllSymbols(filteredSymbols);
    } catch (err) {
      console.error(err);
      setIsError(
        "Received an error while making a symbols list request. Try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, [activeFilters]);

  const toggleFilter = useCallback((label: string) => {
    const exclusiveCheckboxes = ["Swap", "Spot", "Future"];
    setActiveFilters((prev) => {
      const isExclusiveCheckbox = exclusiveCheckboxes.includes(label);
      const isCheckboxActive = prev.includes(label);
      if (isExclusiveCheckbox) {
        return isCheckboxActive
          ? prev.filter((filter) => filter !== label)
          : [
              ...prev.filter((filter) => !exclusiveCheckboxes.includes(filter)),
              label,
            ];
      }

      return isCheckboxActive
        ? prev.filter((filter) => filter !== label)
        : [...prev, label];
    });
  }, []);

  useEffect(() => {
    loadSymbols();
  }, [loadSymbols]);

  return (
    <Card className="flex flex-col align-items-center justify-center w-full max-w-xl mx-auto mt-10 p-4 space-y-6 shadow-xl min-h-[300px] overflow:hidden">
      {loading ? (
        <>
          <Loading
            message={
              selectedSymbols.length >= 3 &&
              (timeframe !== "1d" || "3d" || "1w" || "1M")
                ? "Small timeframe and many symbols, it might take a while."
                : "Loading exchange info..."
            }
          />
          {progress > 0 ? (
            <Progress value={progress} className="w-80%" />
          ) : null}
        </>
      ) : (
        <CardContent className="space-y-4">
          <motion.div {...fadeIn}>
            <div className={!exchangeId ? disabledStyle : ""}>
              <div className="space-y-4">
                <FilterPanel
                  filterConditions={filterConditions}
                  activeFilters={activeFilters}
                  toggleFilter={toggleFilter}
                />
                <div className="p-4 text-center">
                  {allSymbols.length} symbols loaded. Only 50 will be shown, use
                  the search to find those you seek.
                </div>
                <SymbolSelector
                  allSymbols={allSymbols}
                  selectedSymbols={selectedSymbols}
                  search={search}
                  setSearch={setSearch}
                  checkForDoubleAndSave={checkForDoubleAndSave}
                />
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
                  <SelectValue placeholder="Choose timeframe" />
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
                <span className="text-sm mb-2">From:</span>
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
                        <span>Choose date</span>
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
                <span className="text-sm mb-1">Until:</span>
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
                        <span>Choose date</span>
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
              className="w-full cursor-pointer"
              onClick={handleSubmit}
              disabled={
                !exchangeId ||
                !selectedSymbols ||
                !timeframe ||
                !fromDate ||
                !toDate
              }
            >
              Make a request
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
