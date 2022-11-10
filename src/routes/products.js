// ************ Require's ************
const express = require('express');
const router = express.Router();

// ************ Controller Require ************
const {list, store, detail, update, destroy ,getImage} = require('../controllers/productsController');


const { productValidator } = require('../validations');
const {uploadProduct} = require('../middlewares')
 
/* products */

router
    .get('/', list)
    .post('/',uploadProduct.array('images'), productValidator, store)
    .get('/:id', detail)
    .patch('/:id',uploadProduct.array('images'),productValidator, update)
    .delete('/:id', destroy)
    .get('/image/:image',getImage)


module.exports = router;
