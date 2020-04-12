require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("express-jwt");
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(
  jwt({
    secret: process.env.JWT_SECRET,
  }).unless({
    path: ["/sign-in", "/register", "/votes"],
  })
);

app.use(require("./routes/sign-in"));
app.use(require("./routes/register"));
app.use(require("./routes/protected"));
app.use(require("./routes/users"));
app.use(require("./routes/groups"));
app.use(require("./routes/guests"));
app.use(require("./routes/surveys"));
app.use(require("./routes/lecturers"));
app.use(require("./routes/votes"));

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
