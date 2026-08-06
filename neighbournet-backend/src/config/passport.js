const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 1. Check if a user already exists with this Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        // 2. If not, check if the email is already registered (e.g. via password signup)
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        if (email) {
          user = await User.findOne({ email: email.toLowerCase() });
          if (user) {
            // Link the existing account to this Google ID
            user.googleId = profile.id;
            if (!user.profilePicture && profile.photos && profile.photos[0]) {
              user.profilePicture = profile.photos[0].value;
            }
            await user.save();
            return done(null, user);
          }
        }

        // 3. Brand new user — create one
        user = await User.create({
          name: profile.displayName,
          email: email ? email.toLowerCase() : `${profile.id}@google.noemail`,
          googleId: profile.id,
          profilePicture: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
        });

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;