// title-scrape.mjs - 제품 제목만 스크래핑
import fs from "node:fs/promises";
import path from "node:path";
import { URL as NodeURL } from "node:url";

const config = {
  url: "https://www.skecherskorea.co.kr/sub_product/list.php?adv=Y&cate=0002_0065_0012_",
  listSelector: ".prod_st",
  fields: [
    { key: "title", selector: ".con_wrap .tit", mode: "text" },
    { key: "priceText", selector: ".price", mode: "text" },
    { key: "price", selector: ".price", mode: "int" },
    { key: "priceArr", selector: ".price", mode: "arr" },
  ],
  outPrefix: "titles_and_prices",
  dropEmpty: true,
  postProcess,
};

function postProcess(item) {
  if (Array.isArray(item.priceArr) && item.priceArr.length) {
    const [beforeRaw, nowRaw, rateRaw] = item.priceArr;

    const before = beforeRaw
      ? parseInt(String(beforeRaw).replace(/[^\d]/g, ""), 10)
      : null;
    if (Number.isFinite(before)) {
      item.priceBefore = before; // 예: 139000
    }

    const now = nowRaw
      ? parseInt(String(nowRaw).replace(/[^\d]/g, ""), 10)
      : null;
    if (Number.isFinite(nowRaw)) {
      item.priceNow = now;
      if (!item.priceText) item.priceText = nowRaw;
    }

    const rate = nowRaw
      ? parseInt(String(rateRaw).replace(/[^\d]/g, ""), 10)
      : null;
    if (Number.isFinite(rateRaw)) {
      item.saleRate = rate;
    }
  }
  return item;
}

function textOf($, node) {
  return $(node).text().replace(/\s+/g, " ").trim();
}

function toIntKRW(s) {
  if (!s) return null;
  const t = String(s).replace(/[^\d]/g, "");
  return t ? parseInt(t, 10) : null;
}

function isEmptyObject(obj) {
  return obj && typeof obj === "object" && Object.keys(obj).length === 0;
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "ko,en;q=0.8",
    },
    redirect: "follow",
  });
  return await res.text();
}

async function scrapeWithConfig(conf) {
  const { url, listSelector, fields } = conf;
  const html = await fetchHtml(url);
  const cheerio = await import("cheerio");
  const $ = cheerio.load(html);

  const $items = $(listSelector);
  const results = [];

  $items.each((_, el) => {
    const $item = $(el);
    const obj = {};

    for (const f of fields) {
      const { key, mode = "text" } = f;
      if (!key) continue;

      const $nodes = $item.find(f.selector);
      if (!$nodes.length) continue;

      const $first = $nodes.first();
      let val = null;

      if (mode === "text") val = textOf($, $first);
      else val = textOf($, $first);

      const shouldSet = Array.isArray(val)
        ? val.length > 0
        : val != null && String(val).trim() !== "";
      if (shouldSet) obj[key] = val;
    }

    // if (!conf.dropEmpty || !isEmptyObject(obj)) results.push(obj);

    const finalObj = conf.postProcess ? conf.postProcess(obj) : obj;
    if (!conf.dropEmpty || !isEmptyObject(finalObj)) results.push(finalObj);
  });

  return results;
}

async function saveResult(items, { url, outPrefix = "scrape" }) {
  const dir = path.resolve("result");
  await fs.mkdir(dir, { recursive: true });
  const now = new Date();
  const ts = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(
    2,
    "0"
  )}${String(now.getMinutes()).padStart(2, "0")}${String(
    now.getSeconds()
  ).padStart(2, "0")}`;
  let host = "site";
  try {
    host = new NodeURL(url).host.replace(/[:/\\]/g, "_");
  } catch {}
  const file = path.join(dir, `${ts}_${outPrefix}_${host}.json`);
  await fs.writeFile(
    file,
    JSON.stringify({ count: items.length, items }, null, 2),
    "utf8"
  );
  return file;
}

(async () => {
  try {
    const items = await scrapeWithConfig(config);
    console.log("=== 제품 제목 목록 ===");
    items.forEach((item, index) => {
      console.log(`${index + 1}. ${item.title}`);
    });
    console.log(`\n총 ${items.length}개 제품`);

    const saved = await saveResult(items, {
      url: config.url,
      outPrefix: config.outPrefix || "scrape",
    });
    console.log(`\n저장됨: ${saved}`);
  } catch (err) {
    console.error("ERROR:", err?.stack || err?.message || String(err));
    process.exit(1);
  }
})();
