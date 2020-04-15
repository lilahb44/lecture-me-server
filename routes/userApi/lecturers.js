const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const { asyncQuery } = require("../../providers/mysqlPool");

router.get(
  "/lecturers",
  asyncHandler(async (req, res) => {
    const userIdFromToken = req.jwtPayload.sub;

    const lecturers = await asyncQuery(
      `SELECT id, CONCAT(l.firstName," ",l.lastName) AS lecturer_name
      FROM lecturers l`
    );

    res.json(lecturers);
  })
);

module.exports = router;
