const express = require("express");
const pool = require("../db");

const router = express.Router();

const parseJSON = (v) => {
  if (v == null) return v;
  if (typeof v === "string") {
    try {
      return JSON.parse(v);
    } catch {
      return v;
    }
  }
  return v; // mysql2가 JSON을 이미 객체로 줄 수도 있음
};

const normalizeProduct = (row) => ({
  productId: row.productId,
  keyImage: row.keyImage,
  title: row.title,
  price: row.price,
  badges: parseJSON(row.badges),
  sizes: parseJSON(row.sizes),
  disabledSizes: parseJSON(row.disabledSizes),
  reviewRating: row.reviewRating,
  reviewCount: row.reviewCount,
  isSoldOut: !!row.isSoldOut,
  priceBefore: row.priceBefore,
  category: row.category,
  saleRate: row.saleRate,
  isNew: !!row.isNew,
  isBest: !!row.isBest,
  thumbs: parseJSON(row.thumbs),
  titleEn: row.titleEn,
});

// GET /api/products
router.get("/", async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM mall_products ORDER BY productId ASC"
    );
    res.json(rows.map(normalizeProduct));
  } catch (e) {
    next(e);
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM mall_products WHERE productId = ? LIMIT 1",
      [req.params.id]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "Not Found" });
    res.json(normalizeProduct(rows[0]));
  } catch (e) {
    next(e);
  }
});

module.exports = router;
