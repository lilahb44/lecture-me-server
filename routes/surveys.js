const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const { asyncQuery } = require("../providers/mysqlPool");
const validate = require("../middlewares/validate");
const { check } = require("express-validator");
const sgMail = require("../providers/sendgrid.js");
const jwt = require("jsonwebtoken");

router.get(
  "/surveys",
  asyncHandler(async (req, res) => {
    const userIdFromToken = req.user.sub;

    const surveys = await asyncQuery(
      `select s.*,
      g.name AS groupName,
      CONCAT(l1.firstName," ",l1.lastName) AS lecturer1_name,
      CONCAT(l2.firstName," ",l2.lastName) AS lecturer2_name,
        votesSum.voted1+votesSum.voted2+votesSum.notVoted AS totalVoters,
        votesSum.voted1+votesSum.voted2 AS totalVotes,
        CONCAT(FORMAT(IF(votesSum.voted1=0,0,(votesSum.voted1/(votesSum.voted1+votesSum.voted2)*100)),2),'%') as percentageVoted1,
      CONCAT(FORMAT(IF(votesSum.voted2=0,0,(votesSum.voted2/(votesSum.voted1+votesSum.voted2)*100)),2),'%') as percentageVoted2
    
          from (
            SELECT surveyId, COUNT(IF(isVoted=1,1,NULL)) as voted1, COUNT(IF(isVoted=2,1,NULL)) as voted2, COUNT(IF(isVoted is NULL,1,NULL)) as notVoted
            FROM votes
              Where surveyId IN (
                      Select surveyId
                      From surveys
                      NATURAL JOIN groups
                      where groups.userId = ?
                    )
            GROUP BY surveyId
              ) votesSum
          Join surveys s ON(s.id=votesSum.surveyId)
          JOIN groups g ON(g.id=s.groupId)
          JOIN lecturers l1 ON(s.lecturer1 = l1.id)
          JOIN lecturers l2 ON(s.lecturer2 = l2.id)`,
      [userIdFromToken]
    );

    res.json(surveys);
  })
);

router.put(
  "/surveys",
  validate([
    check("lecturer1").exists(),
    check("lecturer2").exists(),
    check("groupId").exists(),
  ]),
  asyncHandler(async (req, res) => {
    const lecturer1 = req.body.lecturer1;
    const lecturer2 = req.body.lecturer2;
    const groupId = req.body.groupId;

    const checkGuests = await asyncQuery(
      `SELECT COUNT(g.id) AS guests
      from guests g 
      WHERE g.groupId = ? 
      `,
      [groupId]
    );

    if (checkGuests[0].guests === 0)
      return res
        .status(400)
        .json({ error: "Your group don`t have guests yet." });

    const result = await asyncQuery(
      "INSERT INTO surveys (lecturer1, lecturer2, groupId, date) values (? ,? ,? ,CONVERT_TZ(NOW(),'SYSTEM','Asia/Jerusalem'))",
      [lecturer1, lecturer2, groupId]
    );

    surveyId = result.insertId;

    const result2 = await asyncQuery(
      `INSERT INTO votes (surveyId , guestId, firstName, lastName, email) 
      SELECT s.id, g.id, g.firstName, g.lastName, g.email
      from guests g 
      JOIN surveys s ON g.groupId = s.groupId 
      WHERE s.id = ? 
      `,
      [surveyId]
    );

    const voters = await asyncQuery(
      `SELECT id, firstName, email
      FROM votes
      where surveyId = ?
      `,
      [surveyId]
    );

    const groupName = await asyncQuery(
      `SELECT g.name
      FROM groups g
      JOIN surveys s
      ON g.id = s.groupId
      where s.id = ?
      `,
      [surveyId]
    );

    const messages = voters.map((x) => {
      return {
        to: x.email,
        from: "lilahb44@gmail.com",
        template_id: "d-55c184fc24034695a4e6b5d167530227",
        dynamic_template_data: {
          firstName: x.firstName,
          name: groupName[0].name,
          voterToken: jwt.sign({}, process.env.JWT_VOTERS_SECRET, {
            subject: x.id.toString(),
          }),
        },
      };
    });

    await sgMail.send(messages);

    res.json(true);
  })
);

module.exports = router;
