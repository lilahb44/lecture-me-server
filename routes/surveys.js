const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const { asyncQuery } = require("../providers/mysqlPool");
const validate = require("../middlewares/validate");
const { check } = require("express-validator");

router.get(
  "/surveys",
  asyncHandler(async (req, res) => {
    const userIdFromToken = req.user.sub;

    const surveys = await asyncQuery(
      "select s.*,g.name from surveys s JOIN groups g ON s.groupId = g.id where g.userId = ?",
      [userIdFromToken]
    );

    res.json(surveys);
  })
);

module.exports = router;
