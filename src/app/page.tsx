import { Footer } from "@/components/Footer";
import { Landing } from "@/components/Landing";

export default function Home() {
  return (
    <div className="py-8 bg-black min-h-screen">
      <Landing />
      <Footer />
    </div>
  );
}
