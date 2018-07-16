const JWT = require('jsonwebtoken');
const User = require('../models/user');
const { JWT_SECRET } = require('../config/config');

signToken = user => {
    return JWT.sign({
        iss : 'nodeAuth',
        sub : user.id,
        iat : new Date().getTime(), //current time
        exp : new Date().setDate(new Date().getDate() + 1),  // current time + 1 day
    }, JWT_SECRET);
}

module.exports = {
    signUp : async (req, res, next) => {
        // Email && password
        const { email, password  }  = req.value.body;

        // Check is there a user with same email
        const foundUser = await User.findOne({ "local.email" : email });
        if(foundUser) {
            return res.status(403).json({error: "Email is already in use"});
        }
        // Create a new user
        const newUser = new User({
            method: 'local',
            local: {
                email : email,
                password : password
            }
        });
        await newUser.save();

        // Generate token
        const token = signToken(newUser);

        // Respond with token
        res.status(200).json({token});
    },

    signIn : async (req, res, next) => {

        // Generate token
        const token = signToken(req.user);
        res.status(200).json({token});
    },

    secret : async (req, res, next) => {
        res.status(200).json({secret : "resource"});
    },

    googleOath: async (req, res, next) => {
        // Generate token
        const token = signToken(req.user);
        res.status(200).json({token});
    },
    facebookOath: async (req, res, next) => {
        // Generate token
        const token = signToken(req.user);
        res.status(200).json({token});
    }   
}