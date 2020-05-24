const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const { asyncQuery } = require("../../providers/mysqlPool");
const jwt = require("express-jwt");
const validate = require("../../middlewares/validate");
const { check } = require("express-validator");

router.post(
  "/invitation",
  validate([check("status").isInt({ min: 0, max: 1 })]),
  asyncHandler(async (req, res) => {
    const invitationIdFromToken = req.jwtPayload.sub;
    const status = req.body.status;

    const updateStatus = await asyncQuery(
      `UPDATE orders SET status = ?
       WHERE id =?`,
      [status, invitationIdFromToken]
    );

    res.json(true);
  })
);

module.exports = router;
