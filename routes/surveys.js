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

module.exports = router;
