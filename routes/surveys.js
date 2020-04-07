const router = require("express").Router();
const asyncHandler = require("express-async-handler");
const { asyncQuery } = require("../providers/mysqlPool");
const validate = require("../middlewares/validate");
const { check } = require("express-validator");

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

    const result = await asyncQuery("INSERT INTO surveys SET ?", {
      lecturer1,
      lecturer2,
      groupId,
    });

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

    res.json(true);
  })
);

module.exports = router;
