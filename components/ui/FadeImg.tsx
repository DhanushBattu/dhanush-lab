"use client";
import { useEffect, useRef, useState } from "react";

/** An <img> that develops in (fade + unblur) once loaded, instead of popping in line by line. */
export default function FadeImg({ className = "", ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (ref.current?.complete) setLoaded(true);
  }, []);
  return (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img
      ref={ref}
      {...props}
      onLoad={(e) => {
        setLoaded(true);
        props.onLoad?.(e);
      }}
      className={`transition-[opacity,filter] duration-700 ease-out motion-reduce:transition-none ${loaded ? "opacity-100 blur-0" : "opacity-0 blur-sm"} ${className}`}
    />
  );
}
