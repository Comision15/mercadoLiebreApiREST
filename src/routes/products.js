// ************ Require's ************
const express = require('express');
const router = express.Router();

// ************ Controller Require ************
const {list, store, detail, update, destroy ,getImage} = require('../controllers/productsController');

/* products */

router
    .get('/', list)
    .post('/', store)
    .get('/:id', detail)
    .put('/:id', update)
    .delete('/:id', destroy)
    .get('/image/:image',getImage)


module.exports = router;
