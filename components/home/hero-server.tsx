import React from "react";
import connectDB from "@/lib/database";
import HeroModel from "@/models/Hero";
import { Hero as HeroClient } from "./hero";

export default async function HeroServer() {
  try {
    await connectDB();
  } catch (e) {
    console.warn(
      "HeroServer: unable to connect to DB, falling back to defaults"
    );
    return <HeroClient />;
  }

  try {
    const doc = await HeroModel.findOne().lean();
    const slides = doc?.slides ?? undefined;
    return <HeroClient initialSlides={slides} />;
  } catch (e) {
    console.warn("HeroServer: failed to load hero document", e);
    return <HeroClient />;
  }
}
