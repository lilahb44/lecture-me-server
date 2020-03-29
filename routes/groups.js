const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const { asyncQuery } = require("../providers/mysqlPool");

router.post(
  "/groups",
  asyncHandler(async (req, res) => {
    const userIdFromToken = req.user.sub;

    const result = await asyncQuery(
      "select id, name from groups where userId = ?",
      [userIdFromToken]
    );

    res.json(result);
  })
);

router.delete(
  "/groups",
  asyncHandler(async (req, res) => {
    const userIdFromToken = req.user.sub;
    const id = req.body.id;
    const result = await asyncQuery(
      "DELETE FROM `groups` where id = ? AND userId = ?",
      [id, userIdFromToken]
    );

    res.json(result.affectedRows === 1);
  })
);

module.exports = router;
