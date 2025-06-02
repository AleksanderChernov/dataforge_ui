"use client";
import ccxt, { OHLCV } from "ccxt";
import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/datepicker";
import { format } from "date-fns";
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
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { Loading } from "../Loading";
import JSZip from "jszip";
import pLimit from "p-limit";
import FilterPanel from "./FilterPanel";
import SymbolSelector from "./SymbolPanel";
import { Progress } from "@/components/ui/progress";
import { FilterConditions } from "@/lib/types";
import SymbolInfo from "./SymbolInfo";

export default function CurrencyHistorySelectors() {
  const exchangeId = "binance";
  const [timeframe, setTimeframe] = useState<string>("");
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [allSymbols, setAllSymbols] = useState<string[]>([]);
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>([
    "Active",
    "Traded",
    "USDT",
  ]);
  const [loadingSymbols, setIsLoadingSymbols] = useState<boolean>(false);
  const [loadingCandles, setIsLoadingCandles] = useState<boolean>(false);
  const [error, setIsError] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [csvFormat, setCsvFormat] = useState<CsvFormatsValues>("default");

  const escapeFilename = (filename: string) =>
    filename.replace(/[/\\?%*:|"<>]/g, "-");

  const cctxTimeframes: { value: string; alias: string }[] = [
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

  type CsvFormatsValues = "default" | "tslab";

  type CsvFormats = {
    value: CsvFormatsValues;
    alias: "Default" | "TSLab";
  };

  const csvFormats: CsvFormats[] = [
    { value: "default", alias: "Default" },
    { value: "tslab", alias: "TSLab" },
  ];

  const handleSubmit = async () => {
    setIsError("");
    setIsLoadingCandles(true);
    setProgress(0);
    try {
      const exchange = new ccxt.binance({
        enableRateLimit: true,
      });
      await exchange.loadMarkets();

      const fromDateFixed = new Date(fromDate!);
      fromDateFixed.setUTCHours(0, 0, 0, 0);

      const toDateFixed = new Date(toDate!);
      toDateFixed.setUTCHours(0, 0, 0, 0);
      toDateFixed.setUTCDate(toDateFixed.getDate() + 1); // grab the end of the next day, not stop at the start

      const fromMs = fromDateFixed.getTime();
      const untilMs = toDateFixed.getTime();

      const listOfConcurrentRequests = pLimit(5);
      const totalSymbols = selectedSymbols.length;

      const timeframeToMilliseconds = (timeframe: string): number => {
        const unit = timeframe.slice(-1);
        const value = parseInt(timeframe.slice(0, -1));

        switch (unit) {
          case "m":
            return value * 60 * 1000;
          case "h":
            return value * 60 * 60 * 1000;
          case "d":
            return value * 24 * 60 * 60 * 1000;
          case "w":
            return value * 7 * 24 * 60 * 60 * 1000;
          case "M":
            return value * 30 * 24 * 60 * 60 * 1000;
          default:
            //15 mins
            return 900000;
        }
      };

      const timeframeMs = timeframeToMilliseconds(timeframe);

      //progress bar logic
      const expectedCandlesPerSymbol = Math.ceil(
        (untilMs - fromMs) / timeframeMs
      );
      const totalExpectedCandles = totalSymbols * expectedCandlesPerSymbol;
      let totalCandlesFetched = 0;

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

                const filteredBatch = batch.filter((row) => row[0]! < untilMs);
                allOHLCV.push(...filteredBatch);

                const lastCandle = batch[batch.length - 1];
                const lastTimestamp = lastCandle[0];

                const lastTimestampWithAddedTimeframe =
                  lastTimestamp! + timeframeMs;

                if (lastTimestampWithAddedTimeframe >= untilMs) {
                  break;
                }

                if (lastTimestamp && startSince >= lastTimestamp) {
                  console.log("Exchange candles changed, our info is now old");
                  break;
                }

                totalCandlesFetched += filteredBatch.length;
                const overallProgress =
                  (totalCandlesFetched / totalExpectedCandles) * 100;
                setProgress(overallProgress);

                startSince = lastTimestampWithAddedTimeframe;

                await exchange.sleep(exchange.rateLimit);
              }
              console.log(`We got ${allOHLCV.length} candles for ${symbol}`);

              let csvHeader = "";
              let csvRows: string[] = [];

              switch (csvFormat) {
                case "default":
                  csvHeader = "timestamp,open,high,low,close,volume";
                  csvRows = allOHLCV.map((row) => row.join(","));
                  break;
                case "tslab":
                  csvHeader = "";
                  if (!allOHLCV[0]) {
                    setIsError(`Exchange returns no datetime`);
                    return;
                  }
                  csvRows = allOHLCV.map((row) => {
                    const date = format(new Date(row[0]!), "MM/dd/yyyy");
                    const time = format(new Date(row[0]!), "HH:mm");
                    const open = String(row[1]);
                    const high = String(row[2]);
                    const low = String(row[3]);
                    const close = String(row[4]);
                    const volume = String(row[5]);
                    return `${date};${time};${open};${high};${low};${close};${volume};`;
                  });
                  break;
              }

              let csv: string;
              switch (csvFormat) {
                case "tslab":
                  csv = csvRows.join("\n");
                  break;
                case "default":
                default:
                  csv = [csvHeader, ...csvRows].join("\n");
                  break;
              }

              return {
                filename: `${escapeFilename(symbol)}_${format(
                  fromDate!,
                  "yyyy_MM-dd"
                )}_${format(toDate!, "yyyy_MM-dd")}.csv`,
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
        link.download = `ohlcv_data:${escapeFilename(
          selectedSymbols.join(".")
        )}.zip`;
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
      setIsLoadingCandles(false);
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
    setIsLoadingSymbols(true);
    setIsError("");
    try {
      const exchange = new ccxt.binance({
        enableRateLimit: true,
      });
      await exchange.loadMarkets();
      const filteredSymbols = Object.values(exchange.markets)
        .filter((symbol) =>
          filterConditions
            .filter((filter) => activeFilters.includes(filter.label))
            .every((filter) => filter.addedCheck(symbol))
        )
        .map(({ symbol }) => symbol);
      setAllSymbols(filteredSymbols);
    } catch (err) {
      console.error(err);
      setIsError(
        "Received an error while making a symbols list request. Try again."
      );
    } finally {
      setIsLoadingSymbols(false);
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
    <Card className="flex flex-col align-items-center justify-center w-full max-w-xl mx-auto mt-10 p-4 space-y-6 shadow-xl min-h-[570px] overflow:hidden">
      {loadingSymbols || loadingCandles ? (
        <>
          <Loading
            message={
              loadingCandles
                ? selectedSymbols.length >= 3 &&
                  !["1d", "3d", "1w", "1M"].includes(timeframe)
                  ? "Small timeframe and many symbols, it might take a while."
                  : "Downloading candles"
                : "Loading symbols"
            }
          />
          {loadingCandles && <Progress value={progress} className="w-80%" />}
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
                  {allSymbols.length} symbols loaded. Use the search to find
                  those you seek.
                </div>
                <SymbolSelector
                  allSymbols={allSymbols}
                  selectedSymbols={selectedSymbols}
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
                <SymbolInfo />
              </div>
            </div>
          </motion.div>

          <motion.div {...fadeIn}>
            <div
              className={cn(
                "flex flex-col",
                selectedSymbols.length === 0 && disabledStyle
              )}
            >
              <span className="text-sm mb-1">Select timeframe</span>
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
            <div className={cn("flex flex-col", !timeframe && disabledStyle)}>
              <span className="text-sm mb-1">Select Dates</span>
              <DatePickerWithRange
                selected={{
                  from: fromDate,
                  to: toDate,
                }}
                onSelect={(from, to) => {
                  setFromDate(from);
                  setToDate(to);
                }}
                disabled={(date) => date > new Date()}
              />
            </div>
          </motion.div>

          <motion.div {...fadeIn}>
            <div
              className={cn("flex flex-col gap-4", !fromDate && disabledStyle)}
            >
              <div className="flex flex-col">
                <span className="text-sm mb-1">CSV Format:</span>
                <Select
                  onValueChange={(value) =>
                    setCsvFormat(value as CsvFormatsValues)
                  }
                  value={csvFormat}
                  disabled={!timeframe}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose CSV Format" />
                  </SelectTrigger>
                  <SelectContent>
                    {csvFormats.map(({ value, alias }) => (
                      <SelectItem key={value} value={value}>
                        {alias}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              Download
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
