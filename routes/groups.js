const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const { asyncQuery } = require("../providers/mysqlPool");
const validate = require("../middlewares/validate");
const { check } = require("express-validator");

router.get(
  "/groups",
  asyncHandler(async (req, res) => {
    const userIdFromToken = req.user.sub;

    const result = await asyncQuery(
      "select id, name from groups where userId = ?",
      [userIdFromToken]
    );

    res.json(result);
  })
);

router.delete(
  "/groups",
  asyncHandler(async (req, res) => {
    const userIdFromToken = req.user.sub;
    const id = req.body.id;
    const result = await asyncQuery(
      "DELETE FROM `groups` where id = ? AND userId = ?",
      [id, userIdFromToken]
    );

    res.json(result.affectedRows === 1);
  })
);

router.put(
  "/groups",
  validate([check("name").isLength({ min: 1, max: 20 })]),
  asyncHandler(async (req, res) => {
    const name = req.body.name;
    const userIdFromToken = req.user.sub;

    const result = await asyncQuery("INSERT INTO groups SET ?", {
      name,
      userId: userIdFromToken
    }).catch(err => {
      if (err.code !== "ER_DUP_ENTRY") throw err;

      return err.code;
    });

    if (result === "ER_DUP_ENTRY")
      return res.status(400).json({ error: "Name already exists." });

    res.json(result.insertId);
  })
);

module.exports = router;
