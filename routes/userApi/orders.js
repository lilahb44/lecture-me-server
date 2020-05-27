const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const { asyncQuery } = require("../../providers/mysqlPool");
const validate = require("../../middlewares/validate");
const { check } = require("express-validator");
const sgMail = require("../../providers/sendgrid.js");
const jwt = require("jsonwebtoken");
const checkoutNodeJssdk = require("@paypal/checkout-server-sdk");
const payPalClient = require("../../providers/paypal");

router.get(
  "/orders",
  asyncHandler(async (req, res) => {
    const userIdFromToken = req.jwtPayload.sub;

    const orders = await asyncQuery(
      `select o.id, g.name AS groupName, CONCAT(l.firstName," ",l.lastName) AS lecturer, o.address, o.date, IF(o.status=1,"Accept", IF(o.status=0,"Decline", IF(o.status=2,"paid", null))) as status, o.price
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
    const price = req.body.price;

    const result = await asyncQuery(
      "INSERT INTO orders (date, lecturerId, groupId, address, price) values (? ,? ,? ,? ,?)",
      [new Date(date), lecturerId, groupId, address, price]
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

router.post(
  "/orders/paypal-pay",
  asyncHandler(async (req, res) => {
    const paypalOrderID = req.body.orderId;

    const paypalOrder = await payPalClient().execute(
      new checkoutNodeJssdk.orders.OrdersGetRequest(paypalOrderID)
    );

    const lecturerOrderId = paypalOrder.result.purchase_units[0].custom_id;

    const userIdFromToken = req.jwtPayload.sub;
    const [
      price,
    ] = await asyncQuery(
      "SELECT price FROM orders o JOIN groups g ON o.groupId = g.id WHERE o.id = ? AND g.userId = ?",
      [lecturerOrderId, userIdFromToken]
    );

    if (price === undefined)
      return res.status(400).json({ error: "Order does not exists" });

    if (
      parseInt(paypalOrder.result.purchase_units[0].amount.value) != price.price
    )
      return res.status(400).json({ error: "Price does not match the order" });

    const saveTransaction = await asyncQuery(
      `UPDATE orders SET status = 2, paypalOrderId = ?
      WHERE orders.id = ?`,
      [paypalOrderID, lecturerOrderId]
    );

    res.json(saveTransaction.affectedRows === 1);
  })
);

module.exports = router;
