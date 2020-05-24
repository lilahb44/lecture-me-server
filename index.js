require("dotenv").config();
const express = require("express");
const requireDir = require("require-dir");
const cors = require("cors");
const jwt = require("express-jwt");
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// No authentication
app.use("/publicApi", Object.values(requireDir("./routes/publicApi")));

app.use(
  jwt({
    secret: process.env.JWT_SECRET,
    requestProperty: "jwtPayload",
  })
);

const validateJWTType = (type) => (req, res, next) =>
  req.jwtPayload.type !== type ? res.sendStatus(401) : next();

app.use(
  "/userApi",
  validateJWTType("user"),
  Object.values(requireDir("./routes/userApi"))
);

app.use(
  "/voteApi",
  validateJWTType("voter"),
  Object.values(requireDir("./routes/voteApi"))
);

app.use(
  "/lecturerApi",
  validateJWTType("lecturer"),
  Object.values(requireDir("./routes/lecturerApi"))
);

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
