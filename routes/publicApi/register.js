const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const { check } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validate = require("../../middlewares/validate");
const { asyncQuery } = require("../../providers/mysqlPool");

router.post(
  "/register",
  validate([
    check("email").isEmail({ max: 50 }),
    check("password").isLength({ min: 6, max: 32 }),
    check("firstName").isLength({ min: 1, max: 45 }),
    check("lastName").isLength({ min: 1, max: 45 }),
  ]),
  asyncHandler(async (req, res) => {
    const { email, password, firstName, lastName } = req.body;

    const result = await asyncQuery("INSERT INTO users SET ?", {
      email,
      password: await bcrypt.hash(password, 3),
      firstName,
      lastName,
    }).catch((err) => {
      if (err.code !== "ER_DUP_ENTRY") throw err;

      return err.code;
    });

    if (result === "ER_DUP_ENTRY")
      return res.status(400).json({ error: "Email already exists." });

    const token = jwt.sign(
      { sub: result.insertId.toString(), type: "user" },
      process.env.JWT_SECRET
    );

    res.json({ token });
  })
);

module.exports = router;
