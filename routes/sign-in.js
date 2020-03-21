const router = require("express").Router();
const { check } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validate = require("../middlewares/validate");
const { asyncQuery } = require("../providers/mysqlPool");

router.post(
  "/sign-in",
  validate([check("email").isEmail(), check("password").isLength({ min: 5 })]),
  async (req, res) => {
    const { email, password } = req.body;

    const rows = await asyncQuery(
      "SELECT id, password FROM users WHERE email = ?",
      [email]
    );

    if (!rows.length) return res.status(400).json("Incorrect email.");

    const isPasswordValid = await bcrypt.compare(password, rows[0].password);

    if (!isPasswordValid) return res.status(400).json("Incorrect Password.");

    const token = jwt.sign({}, process.env.JWT_SECRET, {
      subject: rows[0].id.toString()
    });

    res.json({ token });
  }
);

module.exports = router;
