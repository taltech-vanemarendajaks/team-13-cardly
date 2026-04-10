import { Header } from "@/components/landing/Header";
import { HeroBanner } from "@/components/landing/HeroBanner";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { FooterCTA } from "@/components/landing/FooterCTA";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroBanner />
        <Features />
        <HowItWorks />
        <Pricing />
        <FAQ />
        <FooterCTA />
      </main>
      <Footer />
    </>
  );
}
