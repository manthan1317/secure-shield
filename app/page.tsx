"use client";

import Image from "next/image";
import Header from "@/component/Header";
import Hero from "@/component/Hero";
import homeBg from "../assets/home-bg.png";
import Stats from "@/component/Stats";
import Features from "@/component/Features";
import Footer from "@/component/Footer";
import Blogs from "@/components/Blog";
import Newsletter from "@/component/Newsletter";
import FooterCta from "@/component/FooterCta";

export default function Home() {
  return (
    <div className="bg">
      <div className="hero">
        <Header />
        <Hero />
        <div className="hero-label"></div>
        <Stats />
        <Features />
        <div className="home-bg">
          <Image src={homeBg} alt="" />
        </div>
      </div>
      <Blogs />
      <FooterCta />
      <Newsletter />
      <Footer />
    </div>
  );
}
