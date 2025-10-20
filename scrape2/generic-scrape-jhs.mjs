// generic-scrape.mjs
import fs from "node:fs/promises";
import path from "node:path";
import { URL as NodeURL } from "node:url";

const config = {
  url: "",
  urls: [
    {
      category: "women",
      url: "https://www.skecherskorea.co.kr/sub_product/list.php?adv=Y&cate=0002_",
    },
    {
      category: "men",
      url: "https://www.skecherskorea.co.kr/sub_product/list.php?adv=Y&cate=0001_",
    },
    {
      category: "kids",
      url: "https://www.skecherskorea.co.kr/sub_product/list.php?adv=Y&cate=0003_",
    },
    {
      category: "best",
      url: "https://www.skecherskorea.co.kr/sub_product/list.php?adv=Y&cate=0005_",
    },
    {
      category: "new",
      url: "https://www.skecherskorea.co.kr/sub_product/list.php?adv=Y&cate=0006_",
    },
  ],
  listSelector: ".prod_st",

  fields: [
    { key: "idx", selector: "", mode: "idx" },
    {
      key: "title",
      selector: ".con_wrap .tit",
      mode: "text",
    },
    {
      key: "priceText",
      selector: ".price",
      mode: "text",
    },
    {
      key: "price",
      selector: ".price",
      mode: "int",
    },
    {
      key: "priceArr",
      selector: ".price",
      mode: "arr",
    },
    {
      key: "badges",
      selector: ".con_wrap > .icon",
      mode: "arr",
    },
    {
      key: "sizes",
      selector: ".size ul.list li",
      mode: "int", // "250" -> 250
      all: true, // 노드들 전부 배열로 모으기
      arrayClean: true,
    },
    {
      key: "disabledSizes",
      selector: ".size ul.list li.off",
      mode: "int",
      all: true,
      arrayClean: true,
    },
    {
      key: "imgArr",
      selector: ".re va_wrap",
      mode: "img",
      attr: "src",
    },
  ],
  outPrefix: "example",
  dropEmpty: true,
  postProcess,
};

function postProcess(item) {
  // priceArr = ["139,000", "109,000", "22%"] 형태일 때
  if (Array.isArray(item.priceArr) && item.priceArr.length) {
    const [beforeRaw, nowRaw, rateRaw] = item.priceArr;

    // 1) 정가
    const before = beforeRaw
      ? parseInt(String(beforeRaw).replace(/[^\d]/g, ""), 10)
      : null;
    if (Number.isFinite(before)) {
      item.priceBefore = before; // 예: 139000
    }

    // 2) 현재가 (price 덮어쓰기)
    const now = nowRaw
      ? parseInt(String(nowRaw).replace(/[^\d]/g, ""), 10)
      : null;
    if (Number.isFinite(now)) {
      item.price = now; // 예: 109000
      // priceText도 없으면 만들어둠(선택)
      if (!item.priceText) item.priceText = nowRaw;
    }

    // 3) 할인율 %
    const rate = rateRaw
      ? parseInt(String(rateRaw).replace(/[^\d]/g, ""), 10)
      : null;
    if (Number.isFinite(rate)) {
      item.saleRate = rate; // 예: 22
    }
  }

  // 배지에서 isNew/isBEST (있다면)
  if (Array.isArray(item.badges)) {
    const up = item.badges.map((s) => String(s).toUpperCase());
    item.isNew = up.some((t) => t.includes("NEW"));
    item.isBEST = up.some((t) => /\bBEST\b/.test(t));
  }

  return item;
}

function absUrl(base, maybe) {
  if (!maybe) return "";
  try {
    return new NodeURL(maybe, base).toString();
  } catch {
    return maybe;
  }
}
function textOf($, node) {
  return $(node).text().replace(/\s+/g, " ").trim();
}
function toIntKRW(s) {
  if (!s) return null;
  const t = String(s).replace(/[^\d]/g, "");
  return t ? parseInt(t, 10) : null;
}
function pickAttr($el, attrSpec = "") {
  const names = attrSpec.split("|").map((s) => s.trim());
  for (const n of names) {
    const v = $el.attr(n);
    if (v) return v;
  }
  return "";
}
function isEmptyObject(obj) {
  return obj && typeof obj === "object" && Object.keys(obj).length === 0;
}
function normalizeSelectors(field) {
  if (Array.isArray(field.selectors) && field.selectors.length)
    return field.selectors;
  if (typeof field.selector === "string") {
    const parts = field.selector
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean);
    return parts.length ? parts : [field.selector];
  }
  return [];
}
function findWithPriority($root, $, field) {
  const sels = normalizeSelectors(field);
  for (const sel of sels) {
    const $nodes = $root.find(sel);
    if ($nodes.length) return $nodes;
  }
  return $();
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

async function scrapeWithConfig() {
  const { urls, listSelector, fields } = config;
  const results = [];

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i].url;
    const category = urls[i].category;
    const html = await fetchHtml(url);
    const cheerio = await import("cheerio");
    const $ = cheerio.load(html);

    const $items = $(listSelector);

    $items.each((_, el) => {
      const $item = $(el);
      const obj = {};

      for (const f of fields) {
        const {
          key,
          mode = "text",
          attr,
          absolute = false,
          all = false,
          arrayClean = false,
          value, // ← mode: "const" 대비
        } = f;
        if (!key) continue;

        // mode: "const"면 DOM 탐색 없이 바로 값 지정
        if (mode === "const") {
          obj[key] = value;
          continue;
        }

        const $nodes = findWithPriority($item, $, f);
        if (!$nodes.length && mode !== "img" && mode !== "idx") continue;

        if (all) {
          const arr = [];
          $nodes.each((__, node) => {
            const $n = $(node);
            let val = null;

            if (mode === "text") {
              val = textOf($, $n);
            } else if (mode === "idx") {
              const aTag = $item.find("a.img_wrap");
              const href = aTag.attr("href");
              const match = href?.match(/idx=(\d+)/);
              const idx = match ? match[1] : null;
              val = idx;
            } else if (mode === "img") {
              const imgSrcList = $item
                .find("span.re.va_wrap img")
                .map((i, el) => $(el).attr("src"))
                .get();
              val = imgSrcList;
            } else if (mode === "attr") {
              const raw = attr ? pickAttr($n, attr) : "";
              val = absolute ? absUrl(url, raw) : raw;
            } else if (mode === "html") {
              val = $n.html()?.trim() || "";
            } else if (mode === "int") {
              val = toIntKRW(textOf($, $n));
            } else if (mode === "arr") {
              const t = textOf($, $n);
              const parts = t ? t.split(/\s+/).filter(Boolean) : [];
              if (parts.length) arr.push(...parts);
              val = null;
            } else {
              val = textOf($, $n);
            }

            if (mode !== "arr") {
              const ok = Array.isArray(val)
                ? val.length > 0
                : val != null && String(val).trim() !== "";
              if (ok) arr.push(val);
            }
          });
          obj[key] = arrayClean ? Array.from(new Set(arr)) : arr;
          continue;
        }

        const $first = $nodes.first();
        let val = null;
        if (mode === "text") {
          val = textOf($, $first);
        } else if (mode === "idx") {
          const aTag = $item.find("a.img_wrap");
          const href = aTag.attr("href");
          const match = href?.match(/idx=(\d+)/);
          const idx = match ? match[1] : null;
          val = idx;
        } else if (mode === "img") {
          const imgSrcList = $item
            .find("span.re.va_wrap img")
            .map((i, el) => $(el).attr("src"))
            .get();
          val = imgSrcList;
        } else if (mode === "attr") {
          const raw = attr ? pickAttr($first, attr) : "";
          val = absolute ? absUrl(url, raw) : raw;
        } else if (mode === "html") {
          val = $first.html()?.trim() || "";
        } else if (mode === "int") {
          val = toIntKRW(textOf($, $first));
        } else if (mode === "arr") {
          const t = textOf($, $first);
          val = t ? t.split(/\s+/).filter(Boolean) : [];
        } else {
          val = textOf($, $first);
        }

        const shouldSet = Array.isArray(val)
          ? val.length > 0
          : val != null && String(val).trim() !== "";
        if (shouldSet) obj[key] = val;
      }

      // ★ 하드코딩 category 주입
      // if (conf.category !== undefined) {
      obj.category = category;
      // }

      const finalObj = config.postProcess ? config.postProcess(obj) : obj;
      if ((!config.dropEmpty || !isEmptyObject(finalObj)) && finalObj.idx)
        results.push(finalObj);
    });
  }

  return results;
}

async function saveResult(items, { outPrefix = "scrape" }) {
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
  // for (let i = 0; i < 1; i++) {

  try {
    const items = await scrapeWithConfig();
    console.log(JSON.stringify({ count: items.length, items }, null, 2));
    const saved = await saveResult(items, {
      outPrefix: config.outPrefix || "scrape",
    });
    console.error(`saved: ${saved}`);
  } catch (err) {
    console.error("ERROR:", err?.stack || err?.message || String(err));
    process.exit(1);
  }
})();
