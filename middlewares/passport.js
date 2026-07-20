const passport = require("passport");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SECRET_KEY,
};

passport.use(
    new JwtStrategy(options, async (payload, done) => {
        try {
            return done(null, payload);
        } catch (error) {
            return done(error, false);
        }
    })
);

module.exports = passport;