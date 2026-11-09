"use client";
import dynamic from "next/dynamic";

// three.js is loaded only in the browser, after the page itself
const DustField = dynamic(() => import("@/components/three/DustField"), { ssr: false });

export default function BackgroundDust() {
  return <DustField />;
}
