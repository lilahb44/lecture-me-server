const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const { asyncQuery } = require("../../providers/mysqlPool");
const validate = require("../../middlewares/validate");
const { check } = require("express-validator");
const sgMail = require("../../providers/sendgrid.js");
const jwt = require("jsonwebtoken");

router.get(
  "/orders",
  asyncHandler(async (req, res) => {
    const userIdFromToken = req.jwtPayload.sub;

    const orders = await asyncQuery(
      `select g.name AS groupName, CONCAT(l.firstName," ",l.lastName) AS lecturer, o.address, o.date, o.status
      from orders o
      JOIN groups g ON g.id=o.groupId
      JOIN lecturers l ON o.lecturerId = l.id
      Where g.userId = ?`,
      [userIdFromToken]
    );

    res.json(orders);
  })
);

module.exports = router;
