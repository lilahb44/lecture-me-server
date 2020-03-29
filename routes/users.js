const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const { asyncQuery } = require("../providers/mysqlPool");

router.get(
  "/users",
  asyncHandler(async (req, res) => {
    const userIdFromToken = req.user.sub;

    const [
      result
    ] = await asyncQuery(
      "select firstName, lastName, email from users where id = ?",
      [userIdFromToken]
    );

    res.json(result);
  })
);

module.exports = router;
