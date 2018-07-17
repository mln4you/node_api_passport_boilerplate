const express = require('express');
const router = require('express-promise-router')();
const UsersController = require('../controllers/users');
const {  validateBody, schemas } = require('../services/helpers/routeHelpers');
const passport = require('passport');
const passportConf = require('../services/passport/passport');

const passportSignIn = passport.authenticate('local', { session : false });
const passportJWT = passport.authenticate('jwt', { session: false });
const passportGoogle = passport.authenticate('googleToken', {session : false});
const passportFacebook = passport.authenticate('facebookToken', {session : false});
router.route('/signup')
    .post(validateBody(schemas.authSchema), UsersController.signUp);

router.route('/signin')
    .post(validateBody(schemas.authSchema), passportSignIn, UsersController.signIn);

router.route('/secret')
    .get(passportJWT, UsersController.secret);

router.route('/oauth/google')
    .post(passportGoogle, UsersController.googleOath);

    router.route('/oauth/facebook')
    .post(passportFacebook, UsersController.facebookOath);

module.exports = router;