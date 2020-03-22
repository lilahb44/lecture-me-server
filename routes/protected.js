const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const { asyncQuery } = require("../providers/mysqlPool");

router.post(
  "/protected",
  asyncHandler(async (req, res) => {
    const userIdFromToken = req.user.sub;

    const [
      { firstName }
    ] = await asyncQuery("select firstName from users where id = ?", [
      userIdFromToken
    ]);

    res.json(`Hello ${firstName}!`);
  })
);

module.exports = router;
