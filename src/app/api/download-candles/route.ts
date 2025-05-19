import { NextResponse } from "next/server";
import ccxt from "ccxt";
import pLimit from "p-limit";
import { Readable } from "node:stream";
//TODO: fix "unknown" type
function bufferToStream(buffer: unknown) {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

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

    console.log(selectedSymbols, from, until, timeframe);

    if (selectedSymbols.length === 0 || !timeframe || !from || !until) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }

    const fromMs = Date.parse(from);
    const untilMs = Date.parse(until);

    //TODO: strange error, can`t pass exchange as a prop
    const exchange = new ccxt.binance({
      enableRateLimit: true,
      options: { defaultType: "perpetual" },
    });
    await exchange.loadMarkets();

    // Don't want to get banned by binance, let's throttle our requests. Since our max symbols is 5, then let's use 5 here too
    const limitOfConcurrentRequests = pLimit(5);

    const csvBuffers = await Promise.all(
      selectedSymbols.map((symbol) =>
        limitOfConcurrentRequests(async () => {
          try {
            const ohlcv = await exchange.fetchOHLCV(
              symbol,
              timeframe,
              fromMs,
              untilMs,
              { limit: 1000 }
            );
            const filtered = ohlcv.filter((row) => row[0]! <= untilMs);
            const csv = [
              "timestamp,open,high,low,close,volume",
              ...filtered.map((row) => row.join(",")),
            ].join("\n");
            return {
              filename: symbol + ".csv",
              buffer: Buffer.from(csv),
            };
          } catch (err) {
            console.error(`Error with ${symbol}: ${err}`);
            return null;
          }
        })
      )
    );

    const archive = archiver("zip", { zlib: { level: 9 } });
    const chunks = [];

    archive.on("data", (chunk) => chunks.push(chunk));
    archive.on("warning", (err) => console.warn("Something is wrong:", err));
    archive.on("error", (err) => {
      throw err;
    });

    for (const file of csvBuffers) {
      if (file) {
        archive.append(bufferToStream(file.buffer), { name: file.filename });
      }
    }

    await archive.finalize();

    // Wait until all chunks collected
    await new Promise((resolve) => archive.on("end", resolve));
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
