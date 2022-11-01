// ************ Require's ************
const express = require('express');
const router = express.Router();

// ************ Controller Require ************
const {getProfile, setProfile, remove, getAvatar} = require('../controllers/usersController');

/* midlewares */
const {checkToken, uploadFile} = require('../middlewares')

/* /users */
router
    .get('/profile', checkToken,  getProfile)
    .get('/avatar/:avatar',getAvatar)
    .patch('/update', uploadFile.single('avatar'),checkToken, setProfile)
    .delete('/remove/:token', remove)

module.exports = router;
