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
  id: row.id,
  title: row.title,
  priceText: row.priceText,
  price: row.price,
  priceArr: parseJSON(row.priceArr),
  badges: parseJSON(row.badges),
  img: row.img,
  imgHover: row.imgHover,
  thumbs: row.thumbs,
  reviewCount: row.reviewCount,
  rating: row.rating,
  sizes: parseJSON(row.sizes),
  disabledSizes: parseJSON(row.disabledSizes),
  category: row.category,
  priceBefore: row.priceBefore,
  saleRate: row.saleRate,
  isNew: !!row.isNew,
  isBest: !!row.isBest,
});

// GET /api/products?page=1&pageSize=12
router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page ?? "1", 10));
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(req.query.pageSize ?? "12", 10))
    );
    const offset = (page - 1) * pageSize;

    const [[{ total }]] = await pool.query(
      "SELECT COUNT(*) AS total FROM mall_products"
    );

    const [rows] = await pool.query(
      `SELECT *
       FROM mall_products
       ORDER BY id ASC
       LIMIT ? OFFSET ?`,
      [pageSize, offset]
    );

    //const totalPages = Math.max(1, Math.ceil(total / pageSize));
    // res.json({
    //   page,
    //   pageSize,
    //   total,
    //   totalPages,
    //   hasPrev: page > 1,
    //   hasNext: page < totalPages,
    //   items: rows.map(normalizeProduct),
    // });
    res.json(rows.map(normalizeProduct));
  } catch (e) {
    next(e);
  }
});
// GET /api/products
router.get("/", async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM mall_products ORDER BY id ASC"
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
      "SELECT * FROM mall_products WHERE id = ?",
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
