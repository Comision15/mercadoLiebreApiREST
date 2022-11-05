const {check} = require('express-validator');

module.exports = [
    check('name')
        .exists().withMessage('El campo es obligatorio')
        .notEmpty().withMessage('El nombre es requerido').bail()
        .isLength({
            min : 10
        }).withMessage('Mínimo 10 caracteres'),
    check('price')
        .exists().withMessage('El campo es obligatorio')
        .notEmpty().withMessage('El precio es requerido').bail()
        .isInt().withMessage('Debe ser un número'),
    check('category')
        .exists().withMessage('El campo es obligatorio')
        .notEmpty().withMessage('La categoría es requerida').bail()
        .isInt().withMessage('Debe ser un número'),
    check('description')
        .exists().withMessage('El campo es obligatorio')
        .notEmpty().withMessage('La descripción es requerida').bail()
        .isLength({
            min : 20
        }).withMessage('Mínimo 20 caracteres'),

]