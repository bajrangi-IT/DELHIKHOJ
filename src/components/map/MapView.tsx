"use client";
import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type LeafletMapType from "./LeafletMap";

const Inner = dynamic(() => import("./LeafletMap"), { ssr: false, loading: () => <div className="skeleton h-full w-full" aria-label="Loading map" /> });

export default function MapView(props: ComponentProps<typeof LeafletMapType>) {
  return <Inner {...props} />;
}
