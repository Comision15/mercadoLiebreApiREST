// ************ Require's ************
const express = require('express');
const router = express.Router();

// ************ Controller Require ************
const {list, store, detail, update, destroy ,getImage} = require('../controllers/productsController');


const { productValidator } = require('../validations');
const {uploadProduct, checkToken} = require('../middlewares');
const checkAdminToken = require('../middlewares/checkAdminToken');
 
/* products */

router
    .get('/', checkToken, list)
    .post('/',checkAdminToken, uploadProduct.array('images'), productValidator, store)
    .get('/:id', detail)
    .patch('/:id',uploadProduct.array('images'),productValidator, update)
    .delete('/:id', destroy)
    .get('/image/:image',getImage)


module.exports = router;
