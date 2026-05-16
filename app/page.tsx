import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import StatsBar from "@/components/home/StatsBar";
import Features from "@/components/home/Features";
import HowItWorks from "@/components/home/HowItWorks";
import BottomCta from "@/components/home/BottomCta";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <StatsBar />
        <Features />
        <HowItWorks />
        <BottomCta />
      </main>
      <Footer />
    </>
  );
}
