import Link from "next/link";
import { CryptoHistory } from "../CryptoHistoryInterface";
import Image from "next/image";
import Socials from "./Socials";

export default function Landing() {
  return (
    <div className="text-white">
      <CryptoHistory />
      <section className="flex flex-col justify-center items-center w-full max-w-xl mx-auto text-center gap-4 fade-in-start animate-fade-in-delay-3">
        <div className="w-full text-3xl p-12 gap-y-4 tracking-tight mb-4 fade-in-start animate-fade-in-delay-1 text-center bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl border border-white/10">
          <Link
            href={"https://thevibe.trading/"}
            className="flex flex-col justify-center items-center "
          >
            Join our community
            <Image
              className="mt-8 mb-4"
              width={183}
              height={36}
              src={"/thevibetrading_logo.png"}
              alt={"The Vibe Trading Logo"}
            />
          </Link>
          <Socials />
        </div>
      </section>
    </div>
  );
}
