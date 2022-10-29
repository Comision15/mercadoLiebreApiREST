// ************ Require's ************
const express = require('express');
const router = express.Router();

// ************ Controller Require ************
const {getProfile, setProfile, remove, getAvatar} = require('../controllers/usersController');

/* midlewares */
const {checkToken} = require('../middlewares')

/* /users */
router
    .get('/profile', checkToken,  getProfile)
    .get('/image/:avatar',getAvatar)
    .put('/update/:token', setProfile)
    .delete('/remove/:token', remove)

module.exports = router;
