import Link from "next/link";
import { CryptoHistory } from "../CryptoHistoryInterface";
import Image from "next/image";

export default function Landing() {
  return (
    <div className="text-white">
      <CryptoHistory />
      <section className="py-24 px-6 text-center max-w-5xl mx-auto bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl shadow-lg border border-white/10 fade-in-start animate-fade-in-delay-1">
        <h1 className="text-5xl font-bold tracking-tight mb-4 fade-in-start animate-fade-in-delay-1">
          Trade Smarter With AI-Powered Strategies
        </h1>
        <p className="text-xl text-gray-300 mb-6 fade-in-start animate-fade-in-delay-2">
          Trading tools built on data and speed
        </p>
        {/* Will be added, when DB is done */}
        {/* <div className="flex justify-center gap-4 fade-in-start animate-fade-in-delay-3">
          <WaitingList />
        </div> */}
        <div className="flex justify-center items-center gap-4 fade-in-start animate-fade-in-delay-3">
          <h3 className="max-w-xl text-3xl p-12 tracking-tight mb-4 fade-in-start animate-fade-in-delay-1 text-center bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl border border-white/10">
            <Link
              href={"https://thevibe.trading/"}
              className="flex flex-col justify-center items-center "
            >
              Join the Vibe
              <Image
                className="mt-8"
                width={183}
                height={36}
                src={"/thevibetrading_logo.png"}
                alt={"The Vibe Trading Logo"}
              />
            </Link>
          </h3>
        </div>
        <div className="flex flex-wrap justify-center gap-6 m-4">
          <a
            href="https://discord.gg/SNRKrSh2wF"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center"
          >
            <div className="w-14 h-14 rounded-full bg-[#5865F2]/10 flex items-center justify-center border border-[#5865F2]/30 group-hover:bg-[#5865F2]/20 transition-colors duration-300">
              <svg
                className="w-7 h-7 text-[#5865F2]"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"></path>
              </svg>
            </div>
          </a>
          <a
            href="https://x.com/vibecatdev"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center"
          >
            <div className="w-14 h-14 rounded-full bg-[#000000]/10 flex items-center justify-center border border-[#000000]/30 group-hover:bg-[#000000]/20 transition-colors duration-300">
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
              </svg>
            </div>
          </a>
          <a
            href="https://t.me/thevibetrading"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center"
          >
            <div className="w-14 h-14 rounded-full bg-[#26A5E4]/10 flex items-center justify-center border border-[#26A5E4]/30 group-hover:bg-[#26A5E4]/20 transition-colors duration-300">
              <svg
                className="w-6 h-6 text-[#26A5E4]"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"></path>
              </svg>
            </div>
          </a>
        </div>
      </section>
    </div>
  );
}
