const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const GooglePlusTokenStrategy = require('passport-google-plus-token');
const FacebookTokenStrategy = require('passport-facebook-token');
const  { ExtractJwt } = require('passport-jwt');
const config = require('../../config');
const User = require('../../models/user');


// JSON WEB TOKENS STRATEGY
passport.use(new JwtStrategy({
    jwtFromRequest : ExtractJwt.fromHeader('authorization'),
    secretOrKey: config.JWT_SECRET
}, async (payload, done) => {
    try {
        // Find the user specified in token
        const user = await User.findById(payload.sub);
    
        // If user doesn't exist handle it 
        if(!user) {
            return done(null , false);
        }

        // Otherwise , return the user
        done(null, user);
    } catch (error) {
        done(error, false);
    }
}));

// GOOGLE OATH STRATEGY
passport.use('googleToken', new GooglePlusTokenStrategy({
    clientID: config.oath.google.clientID,
    clientSecret: config.oath.google.clientSecret
}, async (accessToken, refreshToken, profile, done) => {
    try{
        // Check whether this current user exists in our DB
    const existingUser = await User.findOne({ "google.id" : profile.id });
    if(existingUser) {
        return done(null, existingUser);
    }

    // If new Account
    const newUSer = new User({
        method: 'google',
        google: {
            id: profile.id,
            email: profile.emails[0].value
        }
    });

    await newUSer.save();
    done(null,newUSer);
    }catch(error){
        done(error, false, error.message);
    }
}));

// FACEBOOK OATH STRATEGY
passport.use('facebookToken', new FacebookTokenStrategy({
    clientID: config.oath.facebook.clientID,
    clientSecret: config.oath.facebook.clientSecret
}, async (accessToken, refreshToken, profile, done) => {
    try{
        // Check whether this current user exists in our DB
    const existingUser = await User.findOne({ "facebook.id" : profile.id });
    if(existingUser) {
        return done(null, existingUser);
    }

    // If new Account
    const newUSer = new User({
        method: 'facebook',
        facebook: {
            id: profile.id,
            email: profile.emails[0].value
        }
    });

    await newUSer.save();
    done(null,newUSer);
    }catch(error){
        done(error, false, error.message);
    }
}));


// LOCAL STRATEGY
passport.use(new LocalStrategy({
    usernameField : 'email'
}, async (email, password, done) => {
    try{
            // Find the user given the email
        const user = await User.findOne({ "local.email": email });

        // If not, hande it
        if(!user) {
            return done(null , false);
        }

        // Check if the passport is correct
        const isMatch =  await user.isValidPassword(password);

        // If not , handle it
        if(!isMatch){
            return done(null, false);
        }

        // Otherwise , return the user
        return done(null, user);

    } catch (error) {
        done(error, false);
    }
}))