// ************ Require's ************
const express = require('express');
const router = express.Router();

// ************ Controller Require ************
const {getProfile, setProfile, remove, getAvatar} = require('../controllers/usersController');

/* midlewares */
const {checkToken, uploadUser} = require('../middlewares');

/* /users */
router
    .get('/profile', checkToken,  getProfile)
    .get('/avatar/:avatar',getAvatar)
    .patch('/update', uploadUser.single('avatar'),checkToken, setProfile)
    .delete('/remove',checkToken, remove)

module.exports = router;
