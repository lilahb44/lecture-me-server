const router = require("express").Router();
const { check } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validate = require("../middlewares/validate");
const { asyncQuery } = require("../providers/mysqlPool");

router.post(
  "/register",
  validate([
    check("email").isEmail(),
    check("password").isLength({ min: 5 }),
    check("firstName").isLength({ min: 2 }),
    check("lastName").isLength({ min: 2 })
  ]),
  async (req, res) => {
    const { email, password, firstName, lastName } = req.body;

    const result = await asyncQuery("INSERT INTO users SET ?", {
      email,
      password: await bcrypt.hash(password, 3),
      firstName,
      lastName
    }).catch(err => {
      if (err.code !== "ER_DUP_ENTRY") throw err;

      return err.code;
    });

    if (result === "ER_DUP_ENTRY")
      return res.status(400).json("Email already exists.");

    const token = jwt.sign({}, process.env.JWT_SECRET, {
      subject: result.insertId.toString()
    });

    res.json({ token });
  }
);

module.exports = router;
