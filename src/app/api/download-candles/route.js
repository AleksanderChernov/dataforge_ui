import ccxt from "ccxt";
import pLimit from "p-limit";

export async function POST(req) {
  try {
    const { symbols, from, until, timeframe } = await req.json();

    //fetchOHLCV method requires time in ms
    const fromMs = Date.parse(from);
    const untilMs = Date.parse(until);

    if (!symbols || !from || !until || !timeframe) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const exchange = new ccxt.binance({
      enableRateLimit: true,
      options: { defaultType: "future" },
    });
    await exchange.loadMarkets();

    //In case people request loads of Symbols and we don't want to get banned, lets run concurrent requests
    const limitConcurrency = pLimit(5);

    const tmpDir = path.join(process.cwd(), "temp_ohlcv_" + Date.now());
    await fs.ensureDir(tmpDir);

    await Promise.all(
      symbols.map((symbol) =>
        limitConcurrency(async () => {
          try {
            const ohlcv = await exchange.fetchOHLCV(symbol, timeframe, fromMs);
            const filtered = ohlcv.filter((row) => row[0] <= untilMs);

            const filename = symbol.replace("/", "_") + ".csv";
            const filepath = path.join(tmpDir, filename);
            const csv = [
              "timestamp,open,high,low,close,volume",
              ...filtered.map((row) => row.join(",")),
            ].join("\n");
            await fs.writeFile(filepath, csv);
          } catch (err) {
            console.error(`Failed to fetch ${symbol}: ${err.message}`);
          }
        })
      )
    );

    const zipPath = path.join(tmpDir, "ohlcv_data.zip");
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.pipe(output);
    archive.directory(tmpDir, false);
    await archive.finalize();

    await new Promise((resolve) => output.on("close", resolve));

    return streamFileAsResponse(zipPath, "ohlcv_data.zip");
  } catch (error) {
    console.error("Internal Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
