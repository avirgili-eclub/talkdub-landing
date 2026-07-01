import { defineConfig } from "astro/config";

// Static landing page — zero JS shipped by default. The interactive bits
// (i18n, hero waveform, pricing toggle) live as plain scripts in /public.
export default defineConfig({
  site: "https://talkdub-landing.avirgilitech.workers.dev",
  compressHTML: true,
  build: {
    inlineStylesheets: "auto",
  },
});
