import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import Services from "@/components/home/Services";
import Gallery from "@/components/home/Gallery";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import Testimonials from "@/components/home/Testimonials";
import GiftCards from "@/components/home/GiftCards";
import CTA from "@/components/home/CTA";

export default function Home() {
  return (
    <>
      <Navbar />

      <Hero />

      <Services />

      <Gallery />

      <WhyChooseUs />

      <Testimonials />

      <GiftCards />

      <CTA />

      <Footer />
    </>
  );
}
