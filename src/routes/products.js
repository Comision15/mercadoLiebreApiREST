// ************ Require's ************
const express = require('express');
const router = express.Router();

// ************ Controller Require ************
const {list, store, detail, update, destroy ,getImage} = require('../controllers/productsController');
const { productAdd } = require('../validations');

/* products */

router
    .get('/', list)
    .post('/', productAdd, store)
    .get('/:id', detail)
    .put('/:id', update)
    .delete('/:id', destroy)
    .get('/image/:image',getImage)


module.exports = router;
