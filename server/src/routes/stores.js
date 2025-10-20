const express = require("express");
const pool = require("../db");

const router = express.Router();

// mall_stores 스키마 예시:
// id, name, add1, add2, tel, result_y(위도), result_x(경도)
const normalizeStore = (row) => ({
  id: row.id,
  name: row.name,
  add1: row.add1,
  add2: row.add2,
  addr: [row.add1, row.add2]
    .filter((v) => v && String(v).trim() !== "")
    .join(" "),
  tel: row.tel,
  lat: row.result_y != null ? Number(row.result_y) : null,
  lng: row.result_x != null ? Number(row.result_x) : null,
});

// GET /api/stores
router.get("/", async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM mall_stores ORDER BY id ASC"
    );
    res.json(rows.map(normalizeStore));
  } catch (e) {
    next(e);
  }
});

// GET /api/stores/:id
router.get("/:id", async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM mall_stores WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0)
      return res.status(404).json({ message: "Not Found" });
    res.json(normalizeStore(rows[0]));
  } catch (e) {
    next(e);
  }
});

module.exports = router;
