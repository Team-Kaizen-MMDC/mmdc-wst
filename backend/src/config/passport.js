const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');


module.exports = function(passport) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    //callbackURL: "/api/v1/auth/google/callback"
    callbackURL: "http://localhost:3000/"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ 
        $or: [{ googleId: profile.id }, { email: profile.emails[0].value }] 
      });

      if (user) {
        if (!user.googleId) {
          user.googleId = profile.id;
          await user.save();
        }
        return done(null, user);
      }

      //Create new user if they don't exist
      user = await User.create({
        googleId: profile.id,
        email: profile.emails[0].value,
        isEmailVerified: true,
        role: 'jobseeker'
      });
      
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }));



passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};