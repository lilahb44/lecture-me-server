const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const { check } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validate = require("../../middlewares/validate");
const { asyncQuery } = require("../../providers/mysqlPool");

router.post(
  "/sign-in",
  validate([
    check("email").isEmail({ max: 50 }),
    check("password").isLength({ min: 6, max: 32 }),
  ]),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const rows = await asyncQuery(
      "SELECT id, password FROM users WHERE email = ?",
      [email]
    );

    if (!rows.length)
      return res.status(400).json({ error: "Incorrect email." });

    const isPasswordValid = await bcrypt.compare(password, rows[0].password);

    if (!isPasswordValid)
      return res.status(400).json({ error: "Incorrect Password." });

    const token = jwt.sign(
      { sub: rows[0].id.toString(), type: "user" },
      process.env.JWT_SECRET
    );

    res.json({ token });
  })
);

module.exports = router;
