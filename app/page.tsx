import React from "react";
import Image from "next/image";
import D from "@/public/logic-gate-or-svgrepo-com.svg";
import cir from "@/public/8bvaKz01 (1).svg";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#1b1c1d] flex flex-col justify-center items-center relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,157,0.15),transparent_60%)] blur-3xl"></div>

      {/* Header */}
      <div className="flex flex-row items-center justify-center text-center mb-6 z-10">
        <Image src={D} alt="Logic Gate" className="h-[8vmax] animate-pulse" />
        <h1 className="text-white text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight drop-shadow-[0_0_10px_rgba(0,255,157,0.3)]">
          Digital Circuit Simulator
        </h1>
      </div>

      {/* Subtext */}
      <p className="text-gray-300 text-center text-lg sm:text-xl lg:text-2xl max-w-2xl mb-8 leading-relaxed z-10">
        Build, test, and analyze your digital circuits virtually — no breadboard
        required.
      </p>

      {/* Circuit Image */}
      <div className="relative z-10">
        <Image
          src={cir}
          alt="Circuit illustration"
          className="h-[14vmax] drop-shadow-[0_0_25px_rgba(0,255,157,0.4)] hover:scale-105 transition-transform duration-500 ease-out"
        />
      </div>

      {/* CTA Button */}
      <Link href="/circuit" className="z-10">
        <button className="mt-10 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-black font-bold text-2xl shadow-[0_0_20px_rgba(0,255,157,0.3)] hover:shadow-[0_0_40px_rgba(0,255,157,0.6)] hover:scale-105 transition-all duration-300">
          Try it out!
        </button>
      </Link>

      <div className="bg-black w-full mt-6 pb-6">
        {/* Description */}
        <div className="text-gray-300 text-center text-base sm:text-lg lg:text-xl mt-12 max-w-3xl leading-relaxed z-10">
          <p className="mb-4">
            This{" "}
            <span className="text-emerald-400 font-semibold">
              Digital Circuit Simulator
            </span>{" "}
            gives you a hands-on way to explore digital logic concepts.
          </p>
          <ul className="text-left list-disc list-inside space-y-2">
            <li>Design circuits visually using logic gates</li>
            <li> Connect components with interactive wires and handles</li>
            <li> Test circuits in real-time</li>
            <li>Learn digital logic through hands-on experimentation</li>
          </ul>
          <p className="mt-6">
            Perfect for students, educators, and hobbyists who want to
            understand digital electronics — no hardware needed.
          </p>
        </div>
      </div>

      {/* Subtle footer glow */}
      <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-[#00ff9d1a] to-transparent"></div>
    </div>
  );
}
