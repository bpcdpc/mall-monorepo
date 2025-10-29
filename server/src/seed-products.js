// src/seed-product.js
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const pool = require("./db");

const USAGE = `
Usage:
  node src/seed-product.js [--truncate] [--dry-run] <jsonFilePath>

Examples:
  node src/seed-product.js data/products.json
  node src/seed-product.js --truncate data/products.json
  node src/seed-product.js --dry-run data/products.json
`;

function parseArgs(argv) {
  const flags = { truncate: false, dryRun: false };
  const files = [];
  for (const a of argv.slice(2)) {
    if (a === "--truncate") flags.truncate = true;
    else if (a === "--dry-run") flags.dryRun = true;
    else files.push(a);
  }
  if (files.length !== 1) {
    console.error(USAGE);
    process.exit(1);
  }
  return { ...flags, file: files[0] };
}

// 필수/옵셔널 키 정규화
function normalizeProduct(p) {
  const required = [
    "productId",
    "keyImage",
    "title",
    "price",
    "reviewRating",
    "reviewCount",
    "isSoldOut",
    "priceBefore",
    "saleRate",
    "isNew",
    "isBest",
    "category",
  ];
  for (const k of required) {
    if (p[k] === undefined) {
      throw new Error(
        `Missing required field "${k}" in product: ${p.title ?? "(no title)"}`
      );
    }
  }
  return {
    // 필수
    productId: String(p.productId),
    keyImage: String(p.keyImage),
    title: String(p.title),
    price: Number(p.price),
    reviewRating: p.reviewRating != null ? Number(p.reviewRating) : 0,
    reviewCount: p.reviewCount != null ? Number(p.reviewCount) : 0,
    isSoldOut: !!p.isSoldOut,
    priceBefore: p.priceBefore != null ? Number(p.priceBefore) : null,
    saleRate: p.saleRate != null ? Number(p.saleRate) : null,
    isNew: !!p.isNew,
    isBest: !!p.isBest,
    category: String(p.category),
    // 비필수
    badges: Array.isArray(p.badges) ? p.badges : [],
    sizes: Array.isArray(p.sizes) ? p.sizes : [],
    disabledSizes: Array.isArray(p.disabledSizes) ? p.disabledSizes : null, // 옵션
    thumbs: Array.isArray(p.thumbs) ? p.thumbs : [],
    titleEn: p.titleEn ? String(p.titleEn) : "",
    colorVariantImages: Array.isArray(p.colorVariantImages)
      ? p.colorVariantImages
      : [],
    colorVariantIds: Array.isArray(p.colorVariantIds) ? p.colorVariantIds : [],
    colorVariantCodes: Array.isArray(p.colorVariantCodes)
      ? p.colorVariantCodes
      : [],
    colorCode: p.colorCode ? String(p.colorCode) : "",
  };
}

async function main() {
  const { truncate, dryRun, file } = parseArgs(process.argv);

  const filePath = path.resolve(file);
  if (!fs.existsSync(filePath)) {
    console.error(`JSON file not found: ${filePath}`);
    process.exit(1);
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (e) {
    console.error("Invalid JSON:", e.message);
    process.exit(1);
  }
  if (!Array.isArray(data)) {
    console.error("Top-level JSON must be an array.");
    process.exit(1);
  }

  const products = data.map(normalizeProduct);

  console.log(`Loaded ${products.length} products from ${filePath}`);
  if (dryRun) {
    console.log("[DRY RUN] Validation passed. Nothing will be written.");
    process.exit(0);
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    if (truncate) {
      console.log("TRUNCATE TABLE mall_products ...");
      await conn.query("TRUNCATE TABLE mall_products");
    }

    // const sql = `
    //   INSERT INTO mall_products
    //   (title, priceText, price, priceArr, badges, sizes, disabledSizes, category,
    //    priceBefore, saleRate, isNew, isBest,
    //    rating, ratingMax, thumbs, img, imgOver)
    //   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    // `;

    const sql = `
      INSERT INTO mall_products
      (productId, keyImage, title, price, badges, sizes, disabledSizes, reviewRating, reviewCount, isSoldOut, priceBefore, saleRate, isNew, isBest, category, thumbs, titleEn, colorVariantImages, colorVariantIds, colorVariantCodes, colorCode)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      try {
        await conn.execute(sql, [
          p.productId,
          p.keyImage,
          p.title,
          p.price,
          JSON.stringify(p.badges),
          JSON.stringify(p.sizes),
          p.disabledSizes != null ? JSON.stringify(p.disabledSizes) : null,
          p.reviewRating,
          p.reviewCount,
          p.isSoldOut ? 1 : 0,
          p.priceBefore,
          p.saleRate,
          p.isNew ? 1 : 0,
          p.isBest ? 1 : 0,
          p.category,
          JSON.stringify(p.thumbs),
          p.titleEn,
          JSON.stringify(p.colorVariantImages),
          JSON.stringify(p.colorVariantIds),
          JSON.stringify(p.colorVariantCodes),
          p.colorCode,
        ]);
      } catch (e) {
        console.error(
          "Insert failed at index",
          i,
          "title=",
          p.title,
          e.message
        );
        throw e;
      }
    }

    await conn.commit();
    console.log(`Inserted ${products.length} rows into mall_products.`);
  } catch (e) {
    await conn.rollback();
    console.error("Seeding failed. Rolled back.", e);
    process.exit(1);
  } finally {
    conn.release();
    process.exit(0);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
