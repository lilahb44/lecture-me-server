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

//
router.put(
  "/orders",
  // validate([check("lecturer").exists(), check("groupId").exists()]),
  asyncHandler(async (req, res) => {
    const date = req.body.date;
    const lecturerId = req.body.lecturerId;
    const groupId = req.body.groupId;
    const address = req.body.address;

    const result = await asyncQuery(
      "INSERT INTO orders (date, lecturerId, groupId, address) values (? ,? ,? ,?)",
      [new Date(date), lecturerId, groupId, address]
    );

    const [lecturer] = await asyncQuery(
      `SELECT l.firstName, l.email
      FROM lecturers l
      JOIN orders o ON l.id=o.lecturerId
      WHERE o.lecturerId = ?`,
      [lecturerId]
    );

    orderId = result.insertId;

    const message = await sgMail.send({
      to: lecturer.email,
      from: "lecturemeproject@gmail.com",
      template_id: "d-168cc1c0de3045f192f8abac273c7e56",
      dynamic_template_data: {
        firstName: lecturer.firstName,
        date: date,
        address: address,
        lecturerToken: jwt.sign(
          {
            sub: lecturerId.toString(),
            orderId: orderId.toString(),
            type: "lecturer",
          },
          process.env.JWT_SECRET
        ),
      },
    });
    res.json(true);
  })
);
//

module.exports = router;
