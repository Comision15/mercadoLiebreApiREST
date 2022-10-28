// ************ Require's ************
const express = require('express');
const router = express.Router();

// ************ Controller Require ************
const {signUp, signIn} = require('../controllers/authController');
const {uploadFile} = require('../middlewares');

/* /users */
router
    .post('/signup', uploadFile.single('avatar'), signUp)
    .post('/signin', signIn)

module.exports = router;
