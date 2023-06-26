require("dotenv").config();
const jwt = require("jwt-simple");
const passport = require("passport");

//ใช้ในการ decode jwt ออกมา
const ExtractJwt = require("passport-jwt").ExtractJwt;
//ใช้ในการประกาศ Strategy
const JwtStrategy = require("passport-jwt").Strategy;

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader("authorization"),
  secretOrKey: process.env.SECRET_KEY,
};

const jwtAuth = new JwtStrategy(jwtOptions, (payload, done) => {
  done(null, true);
  //   else done(null, false);
});

const requireJWTAuth = (req, res, next) => {
  passport.authenticate("jwt", { session: false })(req, res, next);
};

passport.use(jwtAuth);

module.exports = requireJWTAuth;
