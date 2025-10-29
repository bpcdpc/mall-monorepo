// generic-scrape.mjs
import fs from "node:fs/promises";
import path from "node:path";
import { URL as NodeURL } from "node:url";

const config = {
  urls: [
    {
      category: "women",
      url: "https://www.skecherskorea.co.kr/sub_product/list.php?adv=Y&cate=0002_0065_0012_",
    },
    {
      category: "men",
      url: "https://www.skecherskorea.co.kr/sub_product/list.php?adv=Y&cate=0001_0052_0007_",
    },
    {
      category: "kids",
      url: "https://www.skecherskorea.co.kr/sub_product/list.php?adv=Y&cate=0003_0093_0187_",
    },
  ],
  listSelector: ".prod_st:has(.con_wrap .tit)",
  fields: [
    {
      key: "productId",
      selector: "",
      mode: "const",
      value: "",
      defaultValue: "",
    },
    {
      key: "keyImage",
      selector: ".re.va_wrap img",
      mode: "attr",
      attr: "src",
      defaultValue: "",
    },
    {
      key: "title",
      selector: ".con_wrap .tit",
      mode: "text",
      defaultValue: "",
    },
    {
      key: "priceText",
      selector: ".price",
      mode: "text",
      defaultValue: "",
    },
    {
      key: "price",
      selector: ".price",
      mode: "int",
      defaultValue: 0,
    },
    {
      key: "priceArr",
      selector: ".price",
      mode: "arr",
      defaultValue: [],
    },
    {
      key: "badges",
      selector: ".con_wrap > .icon span.ico",
      mode: "text",
      all: true,
      arrayClean: true,
      defaultValue: [],
    },
    {
      key: "sizes",
      selector: ".size ul.list li",
      mode: "int", // "250" -> 250
      all: true, // 노드들 전부 배열로 모으기
      arrayClean: true,
      defaultValue: [],
    },
    {
      key: "disabledSizes",
      selector: ".size ul.list li.off",
      mode: "int",
      all: true,
      arrayClean: true,
      defaultValue: [],
    },
    {
      key: "colorVariantImages",
      selector: ".otherC .otherC_wrap img",
      mode: "attr",
      attr: "src",
      all: true,
      absolute: true,
      arrayClean: true,
    },
    {
      key: "colorVariantIds",
      selector: "",
      mode: "const",
      value: "",
      defaultValue: [],
    },
    {
      key: "colorVariantCodes",
      selector: "",
      mode: "const",
      value: "",
      defaultValue: [],
    },
    {
      key: "reviewRating",
      selector: ".tt_star.st1 .star i.xi",
      mode: "attr",
      attr: "class",
      all: true,
      defaultValue: [],
    },
    {
      key: "reviewCount",
      selector: ".tt_star.st1 .no",
      mode: "int",
      defaultValue: 0,
    },
    {
      key: "isSoldOut",
      selector: "",
      mode: "const",
      value: false,
      defaultValue: false,
    },
    {
      key: "priceBefore",
      selector: "",
      mode: "const",
      value: 0,
      defaultValue: 0,
    },
    {
      key: "saleRate",
      selector: "",
      mode: "const",
      value: 0,
      defaultValue: 0,
    },
    {
      key: "isNew",
      selector: "",
      mode: "const",
      value: false,
      defaultValue: false,
    },
    {
      key: "isBest",
      selector: "",
      mode: "const",
      value: false,
      defaultValue: false,
    },
  ],
  dropEmpty: true,
  detail: {
    urlFromField: "href",
    urlSelector: "> a",
    urlAttr: "href",
    delayMs: 150, // 사이트 배려용(선택)
    fields: [
      {
        key: "thumbs",
        selector: ".swiper-wrapper.list li .re.va_wrap img",
        mode: "attr",
        attr: "src",
        all: true,
        absolute: true,
        arrayClean: true,
      },
      {
        key: "titleEn",
        selector: ".prodView_top .info_wrap .tit .kr",
        mode: "text",
        defaultValue: "",
      },
      {
        key: "colorCode",
        selector: ".opt_wrap .opt_section.tt + .opt_section .tit",
        mode: "text",
        defaultValue: "",
      },
    ],
    // 상세 페이지 후처리 훅(선택)
    postProcess: (obj, ctx) => obj,
  },
};

// colorCode를 저장할 맵을 클로저로 관리
const createPostProcessor = () => {
  // 1) 전역 색상코드 맵: productId -> colorCode
  const colorCodeMap = new Map();
  // 2) 후처리용 아이템 보관 (2-pass 용)
  const bucket = [];

  return {
    // 1-pass: 각 아이템의 기초 정보만 수집 (colorVariantIds, productId, colorCode)
    postProcess(item) {
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

      // 배지에서 isNew/isBest 추출
      if (Array.isArray(item.badges) && item.badges.length > 0) {
        const upperBadges = item.badges.map((badge) =>
          String(badge).toUpperCase()
        );
        item.isNew = upperBadges.some((badge) => /\bNEW\b/.test(badge));
        item.isBest = upperBadges.some((badge) => /\bBEST\b/.test(badge));
      }

      // 리뷰 별점 계산
      if (Array.isArray(item.reviewRating) && item.reviewRating.length > 0) {
        // 클래스 정보에서 별점 계산: on=1점, half=0.5점
        let totalRating = 0;
        item.reviewRating.forEach((className) => {
          if (className && className.includes("half")) {
            totalRating += 0.5; // half 클래스
          } else if (className && className.includes("on")) {
            totalRating += 1; // on 클래스
          }
        });
        item.reviewRating = Math.round(totalRating * 10) / 10; // 소수점 1자리까지
      }

      // 품절 여부 판별
      if (Array.isArray(item.sizes) && Array.isArray(item.disabledSizes)) {
        // 모든 사이즈가 비활성화된 경우에만 품절
        const allSizesDisabled = item.sizes.every((size) =>
          item.disabledSizes.includes(size)
        );
        item.isSoldOut = allSizesDisabled;
      }

      // keyImage와 제품 ID 처리
      if (item.keyImage && item.keyImage.trim() !== "") {
        // keyImage가 유효한 경우 ID 추출
        const urlParts = item.keyImage.split("/");
        const filename = urlParts[urlParts.length - 1]; // SL0WPCFY052_1.jpg

        // _숫자.확장자 부분 제거: SL0WPCFY052_1.jpg -> SL0WPCFY052
        const productId = filename.replace(/_\d+\.[^.]+$/, "");

        if (productId) {
          item.productId = productId;
        }
      }

      // colorVariantImages에서 colorVariantIds 추출
      if (item.colorVariantImages) {
        // 1단계: 이미지 URL 배열 정리 (공백 제거, 빈 문자열 필터링)
        const colorImages = item.colorVariantImages
          .map((c) => c.trim())
          .filter((c) => c !== "");

        // 2단계: 색상 ID를 저장할 배열 초기화
        const colorIds = [];

        // 3단계: 각 이미지 URL에서 색상 ID 추출
        for (const c of colorImages) {
          // URL에서 파일명 추출 (예: /path/to/SL0WPCFY052_2.jpg -> SL0WPCFY052_2.jpg)
          const urlParts = c.split("/");
          const filename = urlParts[urlParts.length - 1];

          // 파일명에서 색상 ID 추출 (예: SL0WPCFY052_2.jpg -> SL0WPCFY052)
          const colorId = filename.replace(/_\d+\.[^.]+$/, "");

          // 4단계: 유효한 ID이고 중복이 아닌 경우에만 추가
          if (colorId && !colorIds.includes(colorId)) {
            colorIds.push(colorId);
          }
        }

        // 5단계: 추출된 색상 ID 배열을 아이템에 할당
        item.colorVariantIds = colorIds;
      }

      // 1단계: 현재 아이템의 colorCode를 맵에 기록 (2-pass에서 사용)
      if (item.colorCode && item.productId) {
        const clean = String(item.colorCode).trim();
        if (clean !== "") colorCodeMap.set(item.productId, clean);
      }

      // 2단계:  colorVariantCodes는 지금은 세팅하지 않고, 2-pass에서 일괄 보완
      if (!Array.isArray(item.colorVariantCodes)) item.colorVariantCodes = [];

      // 3단계 : 2-pass용 버킷에 보관
      bucket.push(item);

      return item;
    },

    // 2-pass: 모든 아이템을 본 뒤, variantId -> colorCode 매핑으로 colorVariantCodes 채우기
    finalize(items) {
      const list = items ?? bucket;
      for (const it of list) {
        const ids = Array.isArray(it.colorVariantIds) ? it.colorVariantIds : [];
        const codes = [];
        for (const id of ids) {
          const code = colorCodeMap.get(id);
          if (code && !codes.includes(code)) codes.push(code);
        }
        // 자기 자신의 colorCode가 목록에 없고, 실제로 같은 시리즈면 포함하고 싶다면 아래 주석 해제
        if (it.colorCode && !codes.includes(it.colorCode))
          codes.push(it.colorCode);

        it.colorVariantCodes = codes;
      }
    },
    cleanup() {
      colorCodeMap.clear();
      bucket.length = 0;
    },
  };
};

// postProcess 함수 생성
const postProcessor = createPostProcessor();
const postProcess = postProcessor.postProcess;

// config 객체에 postProcess 추가
config.postProcess = postProcess;

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
function toInt(s) {
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

async function scrapeWithConfig(conf) {
  const { url, listSelector, fields, category, detail } = conf;
  const html = await fetchHtml(url);
  const cheerio = await import("cheerio");
  const $ = cheerio.load(html);

  const $items = $(listSelector);
  const results = [];

  for (let i = 0; i < $items.length; i++) {
    const $item = $($items[i]);
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
        defaultValue, // ← 기본값
      } = f;
      if (!key) continue;

      // mode: "const"면 DOM 탐색 없이 바로 값 지정
      if (mode === "const") {
        obj[key] = value;
        continue;
      }

      const $nodes = findWithPriority($item, $, f);
      if (!$nodes.length) {
        // 노드를 찾지 못했을 때 기본값 설정
        obj[key] = defaultValue;
        continue;
      }

      // 공통 데이터 추출 함수
      const extractValue = ($node) => {
        if (mode === "text") return textOf($, $node);
        else if (mode === "attr") {
          const raw = attr ? pickAttr($node, attr) : "";
          return absolute ? absUrl(conf.url, raw) : raw;
        } else if (mode === "html") return $node.html()?.trim() || "";
        else if (mode === "int") return toInt(textOf($, $node));
        else if (mode === "arr") {
          const t = textOf($, $node);
          return t ? t.split(/\s+/).filter(Boolean) : [];
        } else if (mode === "img") {
          const raw = attr ? pickAttr($node, attr) : "";
          return absolute ? absUrl(conf.url, raw) : raw;
        } else return textOf($, $node);
      };

      if (all) {
        const arr = [];
        $nodes.each((__, node) => {
          const $n = $(node);
          const val = extractValue($n);

          if (mode === "arr") {
            if (val && val.length) arr.push(...val);
          } else {
            const ok = Array.isArray(val)
              ? val.length > 0
              : val != null && String(val).trim() !== "";
            if (ok) arr.push(val);
          }
        });
        const result = arrayClean ? Array.from(new Set(arr)) : arr;
        obj[key] = result.length > 0 ? result : defaultValue;
      } else {
        const $first = $nodes.first();
        const val = extractValue($first);

        const shouldSet = Array.isArray(val)
          ? val.length > 0
          : val != null && String(val).trim() !== "";
        obj[key] = shouldSet ? val : defaultValue;
      }
    }

    // 카테고리 부여
    if (conf.category !== undefined) {
      obj.category = conf.category;
    }

    // 상세 페이지 처리
    if (detail) {
      const detailUrl = extractDetailUrl($item, detail, conf.url);
      if (detailUrl) {
        console.log(`상세 페이지 스크래핑: ${detailUrl}`);
        const detailData = await scrapeDetailPage(detailUrl, detail);
        Object.assign(obj, detailData);
      }
    }

    // 후처리
    const finalObj = conf.postProcess ? conf.postProcess(obj) : obj;
    if (!conf.dropEmpty || !isEmptyObject(finalObj)) results.push(finalObj);
  }

  return results;
}

function extractDetailUrl($item, detail, baseUrl) {
  const { urlFromField, urlSelector, urlAttr } = detail;

  if (urlFromField && urlSelector) {
    const $link = $item.find(urlSelector);
    if ($link.length) {
      const href = urlAttr ? $link.attr(urlAttr) : $link.attr("href");
      if (href) {
        return absUrl(baseUrl, href);
      }
    }
  }
  return null;
}

async function scrapeDetailPage(url, detail) {
  try {
    const html = await fetchHtml(url);
    const cheerio = await import("cheerio");
    const $ = cheerio.load(html);
    const $doc = $.root();

    const obj = {};

    for (const f of detail.fields) {
      const {
        key,
        mode = "text",
        attr,
        absolute = false,
        all = false,
        arrayClean = false,
        defaultValue,
      } = f;
      if (!key) continue;

      const $nodes = findWithPriority($doc, $, f);
      if (!$nodes.length) {
        obj[key] = defaultValue;
        continue;
      }

      // 공통 데이터 추출 함수
      const extractValue = ($node) => {
        if (mode === "text") return textOf($, $node);
        else if (mode === "attr") {
          const raw = attr ? pickAttr($node, attr) : "";
          return absolute ? absUrl(url, raw) : raw;
        } else if (mode === "html") return $node.html()?.trim() || "";
        else if (mode === "int") return toInt(textOf($, $node));
        else if (mode === "arr") {
          const t = textOf($, $node);
          return t ? t.split(/\s+/).filter(Boolean) : [];
        } else if (mode === "img") {
          const raw = attr ? pickAttr($node, attr) : "";
          return absolute ? absUrl(url, raw) : raw;
        } else return textOf($, $node);
      };

      if (all) {
        const arr = [];
        $nodes.each((__, node) => {
          const $n = $(node);
          const val = extractValue($n);

          if (mode === "arr") {
            if (val && val.length) arr.push(...val);
          } else {
            const ok = Array.isArray(val)
              ? val.length > 0
              : val != null && String(val).trim() !== "";
            if (ok) arr.push(val);
          }
        });
        const result = arrayClean ? Array.from(new Set(arr)) : arr;
        obj[key] = result.length > 0 ? result : defaultValue;
      } else {
        const $first = $nodes.first();
        const val = extractValue($first);

        const shouldSet = Array.isArray(val)
          ? val.length > 0
          : val != null && String(val).trim() !== "";
        obj[key] = shouldSet ? val : defaultValue;
      }
    }

    return detail.postProcess ? detail.postProcess(obj) : obj;
  } catch (error) {
    console.error(`상세 페이지 스크래핑 실패: ${url}`, error);
    return {};
  }
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
    const allResults = [];

    // 각 URL별로 스크래핑 실행
    for (const urlConfig of config.urls) {
      console.log(
        `\n=== ${urlConfig.category.toUpperCase()} 카테고리 스크래핑 시작 ===`
      );
      console.log(`URL: ${urlConfig.url}`);

      const items = await scrapeWithConfig({
        ...config,
        url: urlConfig.url,
        category: urlConfig.category,
      });

      console.log(
        `${urlConfig.category}: ${items.length}개 상품 스크래핑 완료`
      );

      // 각 카테고리별로 파일 저장
      // const saved = await saveResult(items, {
      //   url: urlConfig.url,
      //   outPrefix: urlConfig.category,
      // });
      // console.log(`저장됨: ${saved}`);

      allResults.push(...items);
    }

    // 전체 결과를 하나의 파일로 저장하기 전에 2-pass로 colorVariantCodes 완성
    postProcessor.finalize(allResults);

    // 전체 결과를 하나의 파일로 저장
    const allSaved = await saveResult(allResults, {
      url: "multiple_categories",
      outPrefix: "products",
    });
    // console.log(`전체 통합 파일 저장됨: ${allSaved}`);

    console.log(`\n=== 전체 결과 ===`);
    console.log(`총 ${allResults.length}개 상품 스크래핑 완료`);
    console.log(`통합 파일이 생성되었습니다.`);

    // 메모리 정리
    postProcessor.cleanup();
    console.log(`메모리 정리 완료`);
  } catch (err) {
    console.error("ERROR:", err?.stack || err?.message || String(err));
    process.exit(1);
  }
})();
