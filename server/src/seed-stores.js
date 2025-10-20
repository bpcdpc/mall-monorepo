require("dotenv").config();
const fs = require("fs");
const path = require("path");
const pool = require("./db");

const USAGE = `
Usage:
  node src/seed-stores.js [--truncate] [--dry-run] <jsonFilePath>

Examples:
  node src/seed-stores.js data/stores.json
  node src/seed-stores.js --truncate data/stores.json
  node src/seed-stores.js --dry-run data/stores.json
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

function toFloatOrNull(v) {
  if (v === undefined || v === null || v === "") return null;
  const n = parseFloat(String(v));
  return Number.isFinite(n) ? n : null;
}

// 필요한 최소 필드: name, add1
function normalizeStore(s, i) {
  if (!s || typeof s !== "object")
    throw new Error(`Invalid item at index ${i}`);
  if (!s.name || !String(s.name).trim())
    throw new Error(`Missing "name" at index ${i}`);
  if (!s.add1 || !String(s.add1).trim())
    throw new Error(`Missing "add1" at index ${i}`);

  return {
    name: String(s.name).trim(),
    add1: String(s.add1).trim(),
    add2: s.add2 != null ? String(s.add2).trim() : null,
    tel: s.tel != null ? String(s.tel).trim() : null,
    result_y: toFloatOrNull(s.result_y), // 위도
    result_x: toFloatOrNull(s.result_x), // 경도
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

  const stores = data.map(normalizeStore);
  console.log(`Loaded ${stores.length} stores from ${filePath}`);

  if (dryRun) {
    console.log("[DRY RUN] Validation passed. Nothing will be written.");
    process.exit(0);
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    if (truncate) {
      console.log("TRUNCATE TABLE mall_stores ...");
      await conn.query("TRUNCATE TABLE mall_stores");
    }

    const sql = `
      INSERT INTO mall_stores
      (name, add1, add2, tel, result_y, result_x)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    for (let i = 0; i < stores.length; i++) {
      const s = stores[i];
      try {
        await conn.execute(sql, [
          s.name,
          s.add1,
          s.add2 ?? null,
          s.tel ?? null,
          s.result_y,
          s.result_x,
        ]);
      } catch (e) {
        console.error("Insert failed at index", i, "name=", s.name, e.message);
        throw e;
      }
    }

    await conn.commit();
    console.log(`Inserted ${stores.length} rows into mall_stores.`);
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
