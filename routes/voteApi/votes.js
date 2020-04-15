const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const { asyncQuery } = require("../../providers/mysqlPool");
const jwt = require("express-jwt");
const validate = require("../../middlewares/validate");
const { check } = require("express-validator");

router.get(
  "/votes",
  asyncHandler(async (req, res) => {
    const voteIdFromToken = req.jwtPayload.sub;

    const [lecturers] = await asyncQuery(
      `SELECT CONCAT(l1.firstName," ",l1.lastName) AS lecturer1_name,
        CONCAT(l2.firstName," ",l2.lastName) AS lecturer2_name
        FROM surveys s
        JOIN votes v ON s.id = v.surveyId
        JOIN lecturers l1 ON(s.lecturer1 = l1.id)
        JOIN lecturers l2 ON(s.lecturer2 = l2.id)
        WHERE v.id = ?;`,
      [voteIdFromToken]
    );

    res.json(lecturers);
  })
);

router.post(
  "/votes",
  validate([check("isVoted").isInt({ min: 1, max: 2 })]),
  asyncHandler(async (req, res) => {
    const voteIdFromToken = req.jwtPayload.sub;
    const isVoted = req.body.isVoted;

    const voted = await asyncQuery(
      `UPDATE votes SET isVoted = ?
       WHERE id =?`,
      [isVoted, voteIdFromToken]
    );

    res.json(true);
  })
);

module.exports = router;
