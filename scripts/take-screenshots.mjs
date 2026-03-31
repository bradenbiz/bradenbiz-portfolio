import puppeteer from "puppeteer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "screenshots");

const sites = [
  { name: "drone-drop-delivery", url: "https://drone-drop-delivery.vercel.app/" },
  { name: "right-hand", url: "https://right-hand-nine.vercel.app" },
  { name: "bravo-painting", url: "https://bravo-painting-estimator.vercel.app/" },
  { name: "dpc-easy", url: "https://dpceasy.com" },
  { name: "fill-my-dpc", url: "https://fillmydpc.com" },
  { name: "priced-in-gold", url: "https://chromewebstore.google.com/detail/priced-in-gold/fedgkhdmbjfedgfjiadialikalpfoikc" },
];

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 960 });

  for (const site of sites) {
    console.log(`Capturing ${site.name} (${site.url})...`);
    try {
      await page.goto(site.url, { waitUntil: "networkidle2", timeout: 30000 });
      // Wait a bit extra for any animations/lazy content
      await new Promise((r) => setTimeout(r, 2000));
      await page.screenshot({
        path: path.join(outDir, `${site.name}.png`),
        type: "png",
      });
      console.log(`  Saved ${site.name}.png`);
    } catch (err) {
      console.error(`  Failed to capture ${site.name}: ${err.message}`);
    }
  }

  await browser.close();
  console.log("Done!");
}

main();
