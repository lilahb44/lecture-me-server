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

router.get(
  "/lecturers/:lectureId",
  asyncHandler(async (req, res) => {
    const userIdFromToken = req.jwtPayload.sub;
    const lectureId = req.params.lectureId;

    const [lecturer] = await asyncQuery(
      `SELECT id, CONCAT(l.firstName," ",l.lastName) AS lecturer_name, catagory,email
      FROM lecturers l
      WHERE id = ?`,
      [lectureId]
    );

    res.json(lecturer);
  })
);

module.exports = router;
