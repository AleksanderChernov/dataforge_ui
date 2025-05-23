import { NextResponse } from "next/server";
import archiver from "archiver";
import ccxt, { OHLCV } from "ccxt";
import pLimit from "p-limit";
export async function POST(req: {
  json: () => PromiseLike<{
    selectedSymbols: string[];
    timeframe: string;
    from: string;
    until: string;
  }>;
}) {
  try {
    const { selectedSymbols, from, until, timeframe } = await req.json();

    if (selectedSymbols.length === 0 || !timeframe || !from || !until) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }

    const fromMs = Date.parse(from);
    const untilMs = Date.parse(until);

    //TODO: strange error, can`t pass exchange as a prop to API, have to double it. Need more research.
    const exchange = new ccxt.binance({
      enableRateLimit: true,
      options: { defaultType: "perpetual" },
    });
    await exchange.loadMarkets();

    // Don't want to get banned by binance, so I throttle our requests. Since our max symbols is 5, then let's use 5 here too
    const listOfConcurrentRequests = pLimit(5);

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

              //Something broke. Edgecase
              if (!batch.length) {
                break;
              }

              //Excluding everything from our upper timelimit. (AI proposed).
              const filteredBatch = batch.filter(
                (candle) => candle[0]! < untilMs
              );
              allOHLCV.push(...filteredBatch);

              const lastTimestamp = batch[batch.length - 1][0];

              //TODO: check again
              if (lastTimestamp && startSince >= lastTimestamp) {
                console.log("Exchange candles changed, our info is now old");
                break;
              }

              //Since 1000 is our limit, it means we got all the candles
              if (batch.length !== 1000) {
                break;
              }

              //basically no exchange has "until" param, so we have to calculate it ourselves. Candles timestamp is our only way to "advance" in time
              startSince = lastTimestamp! + 1;

              //Just to be sure in cases of "1m" timeframe 1 week long
              await exchange.sleep(exchange.rateLimit);
            }
            console.log(`We got ${allOHLCV.length} candles for ${symbol}`);
            //I took https://data.binance.vision/?prefix=data/futures/um/daily/klines/1000XUSDT/1d/ as an example
            const csv = [
              "timestamp,open,high,low,close,volume",
              ...allOHLCV.map((row) => row.join(",")),
            ].join("\n");
            return {
              filename: symbol + ".csv",
              buffer: Buffer.from(csv),
            };
          } catch (err) {
            console.error(`Error with ${symbol}: ${err}`);
            return;
          }
        })
      )
    );

    //HAve to use archiver and write all of our results to an archive
    const archive = archiver("zip", { zlib: { level: 9 } });
    const chunks: Buffer<ArrayBufferLike>[] = [];

    console.log("Archiving starts");
    archive.on("entry", (entry) => {
      console.log(`Added to zip: ${entry.name}`);
    });
    archive.on("data", (chunk) => chunks.push(chunk));
    archive.on("warning", (err) => console.warn("Something is wrong:", err));
    archive.on("error", (err) => {
      throw err;
    });

    console.log("Start appending info to archives");
    for (const file of csvBuffers) {
      if (file) {
        archive.append(file.buffer, { name: file.filename });
      }
    }

    const archiveComplete = new Promise<void>((resolve, reject) => {
      archive.on("end", resolve);
      archive.on("error", reject);
    });

    archive.finalize();

    await archiveComplete;

    console.log("Archive complete, creating buffer stream");
    const zipBuffer = Buffer.concat(chunks);

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="ohlcv_history_data.zip"',
      },
    });
  } catch (err) {
    console.error("Internal Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
