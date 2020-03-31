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
module.exports = router;
