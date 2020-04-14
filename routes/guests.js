const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const { asyncQuery } = require("../providers/mysqlPool");
const validate = require("../middlewares/validate");
const { check } = require("express-validator");

const validateGroupUserConnection = asyncHandler(async (req, res, next) => {
  const userIdFromToken = req.jwtPayload.sub;
  const groupId = req.params.groupId;

  const [
    { userConnectedToGroup },
  ] = await asyncQuery(
    "select count(*) AS userConnectedToGroup from groups where id=? and userId=?",
    [groupId, userIdFromToken]
  );

  if (!userConnectedToGroup)
    return res.status(400).json({ error: "Group doesn't match to user." });

  next();
});

router.get(
  "/groups/:groupId",
  validateGroupUserConnection,
  asyncHandler(async (req, res) => {
    const groupId = req.params.groupId;

    const [group] = await asyncQuery(
      "select id, name from groups where id = ?",
      [groupId]
    );

    const guests = await asyncQuery(
      "select id, firstName, lastName, email from guests where groupId = ?",
      [groupId]
    );

    res.json({
      id: group.id,
      name: group.name,
      guests,
    });
  })
);

router.delete(
  "/groups/:groupId/guests",
  validate([check("id").exists()]),
  validateGroupUserConnection,
  asyncHandler(async (req, res) => {
    const groupId = req.params.groupId;
    const id = req.body.id;
    const result = await asyncQuery(
      "DELETE FROM `guests` where id = ? AND groupId = ?",
      [id, groupId]
    );

    res.json(result.affectedRows === 1);
  })
);

router.put(
  "/groups/:groupId/guests",
  validate([
    check("firstName").isLength({ min: 1, max: 45 }),
    check("lastName").isLength({ min: 1, max: 45 }),
    check("email").isEmail({ max: 50 }),
  ]),
  validateGroupUserConnection,
  asyncHandler(async (req, res) => {
    const { firstName, lastName, email } = req.body;
    const groupId = req.params.groupId;

    const result = await asyncQuery("INSERT INTO guests SET ?", {
      firstName,
      lastName,
      email,
      groupId,
    }).catch((err) => {
      if (err.code !== "ER_DUP_ENTRY") throw err;

      return err.code;
    });

    if (result === "ER_DUP_ENTRY")
      return res.status(400).json({ error: "Email already exists." });

    res.json(result.insertId);
  })
);

router.post(
  "/groups/:groupId/guests",
  validate([
    check("id").exists(),
    check("firstName").isLength({ min: 1, max: 45 }),
    check("lastName").isLength({ min: 1, max: 45 }),
    check("email").isEmail({ max: 50 }),
  ]),
  validateGroupUserConnection,
  asyncHandler(async (req, res) => {
    const { id, firstName, lastName, email } = req.body;
    const groupId = req.params.groupId;
    const result = await asyncQuery(
      "UPDATE guests SET firstName = ?, lastName = ?,  email = ? where id = ? AND groupId = ?",
      [firstName, lastName, email, id, groupId]
    ).catch((err) => {
      if (err.code !== "ER_DUP_ENTRY") throw err;

      return err.code;
    });

    if (result === "ER_DUP_ENTRY")
      return res.status(400).json({ error: "Email already exists." });

    res.json(result.affectedRows === 1);
  })
);

module.exports = router;
