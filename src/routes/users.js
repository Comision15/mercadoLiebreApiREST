// ************ Require's ************
const express = require('express');
const router = express.Router();

// ************ Controller Require ************
const {getProfile, setProfile, remove} = require('../controllers/usersController');

/* /users */
router
    .get('/profile', getProfile)
    .put('/update/:token', setProfile)
    .delete('/remove/:token', remove)

module.exports = router;
