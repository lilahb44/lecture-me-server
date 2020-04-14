require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("express-jwt");
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// No authentication
app.use(require("./routes/sign-in")).use(require("./routes/register"));

app.use(
  jwt({
    secret: process.env.JWT_SECRET,
    requestProperty: "jwtPayload",
  })
);

const validateJWTType = (type) => (req, res, next) =>
  req.jwtPayload.type !== type ? res.sendStatus(401) : next();

app.use(
  express
    .Router()
    .use(validateJWTType("user"))
    .use(require("./routes/users"))
    .use(require("./routes/groups"))
    .use(require("./routes/guests"))
    .use(require("./routes/surveys"))
    .use(require("./routes/lecturers"))
);

app.use(
  express.Router().use(validateJWTType("voter")).use(require("./routes/votes"))
);

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
