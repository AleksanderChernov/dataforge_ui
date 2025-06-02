import { Landing } from "@/components/Landing";
import Head from "next/head";

export default function Home() {
  return (
    <div className="py-8 bg-black min-h-screen">
      <Head>
        <meta
          name="description"
          content="Download historical cryptocurrency data in CSV format. Supports Binance. Get OHLCV data for analysis."
        />
        <title>Crypto History Data Downloader | DataForge</title>
      </Head>
      <Landing />
    </div>
  );
}
