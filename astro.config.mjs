import { defineConfig } from "astro/config";

// Static landing page — zero JS shipped by default. The interactive bits
// (i18n, hero waveform, pricing toggle) live as plain scripts in /public.
export default defineConfig({
  site: "https://parla.veinticuatro7.app",
  compressHTML: true,
  build: {
    inlineStylesheets: "auto",
  },
});
