const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const { asyncQuery } = require("../providers/mysqlPool");
const jwt = require("express-jwt");

router.use(
  jwt({
    secret: process.env.JWT_VOTERS_SECRET,
  })
);

router.get(
  "/votes",
  asyncHandler(async (req, res) => {
    const voteIdFromToken = req.user.sub;

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

module.exports = router;
