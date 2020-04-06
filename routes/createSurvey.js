const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const { asyncQuery } = require("../providers/mysqlPool");
const validate = require("../middlewares/validate");
const { check } = require("express-validator");

router.get(
  "/createSurvey",
  asyncHandler(async (req, res) => {
    const userIdFromToken = req.user.sub;

    const groups = await asyncQuery(
      `SELECT name
        FROM groups g
        WHERE g.userId = ?`,
      [userIdFromToken]
    );

    const lecturers = await asyncQuery(
      `SELECT distinct
      CONCAT(l.firstName," ",l.lastName) AS lecturer_name
      FROM lecturers l`
    );

    res.json({
      groups,
      lecturers,
    });
  })
);

module.exports = router;
