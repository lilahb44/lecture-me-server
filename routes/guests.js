const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const { asyncQuery } = require("../providers/mysqlPool");
const validate = require("../middlewares/validate");
const { check } = require("express-validator");

router.get(
  "/groups/:groupId",
  asyncHandler(async (req, res) => {
    const userIdFromToken = req.user.sub;
    const groupId = req.params.groupId;

    const groups = await asyncQuery(
      "select id, name from groups where userId = ? AND id = ?",
      [userIdFromToken, groupId]
    );

    if (groups.length === 0)
      return res.status(400).json({ error: "Group not exists." });

    const guests = await asyncQuery(
      "select id, firstName, lastName, email from guests where groupId = ?",
      [groupId]
    );

    res.json({
      id: groups[0].id,
      name: groups[0].name,
      guests
    });
  })
);

router.delete(
  "/groups/:groupId/guests",
  validate([check("id").exists()]),
  asyncHandler(async (req, res) => {
    const userIdFromToken = req.user.sub;
    const groupId = req.params.groupId;
    const id = req.body.id;
    const result = await asyncQuery(
      "DELETE FROM `guests` where id = ? AND groupId = ? AND groupId IN (SELECT id from groups WHERE userId = ?)",
      [id, groupId, userIdFromToken]
    );

    res.json(result.affectedRows === 1);
  })
);

router.put(
  "/groups/:groupId/guests",
  validate([check("firstName").isLength({ min: 1, max: 45 })]),
  validate([check("lastName").isLength({ min: 1, max: 45 })]),
  validate([check("email").isEmail({ max: 50 })]),
  asyncHandler(async (req, res) => {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const groupId = req.params.groupId;

    const result = await asyncQuery("INSERT INTO guests SET ?", {
      firstName,
      lastName,
      email,
      groupId
    }).catch(err => {
      if (err.code !== "ER_DUP_ENTRY") throw err;

      return err.code;
    });

    if (result === "ER_DUP_ENTRY")
      return res.status(400).json({ error: "Email already exists." });

    res.json(result.insertId);
  })
);

module.exports = router;
