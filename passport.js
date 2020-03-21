const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const pool = require("./providers/mysqlPool");
const saltRounds = 10;

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  pool.query("SELECT * FROM users WHERE id = ? ", [id], function(err, rows) {
    if (err) return done(err);
    if (!rows.length) return done(new Error("User not found."));

    done(null, rows[0]);
  });
});

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password"
    },
    function(email, password, done) {
      pool.query("SELECT * FROM users WHERE email = ?", [email], function(
        err,
        rows
      ) {
        if (err) return done(err);
        if (!rows.length)
          return done(null, false, { message: "Incorrect email." });

        bcrypt.compare(password, rows[0].password, function(err, result) {
          if (err) return done(err);
          if (!result)
            return done(null, false, { message: "Incorrect password." });

          return done(null, rows[0]);
        });
      });
    }
  )
);
