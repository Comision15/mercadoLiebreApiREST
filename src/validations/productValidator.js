const {check, body} = require('express-validator');
const db = require('../database/models')

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
    body('category')
        .exists().withMessage('El campo es obligatorio')
        .notEmpty().withMessage('La categoría es requerida').bail()
        .isInt().withMessage('Debe ser un número')
        .custom((value, {req}) => {
            
            return db.Category.findAll()
                .then(categories => {
                     let idsCategories = categories.map(category => category.id);
                     if(!idsCategories.includes(+value)){
                        return Promise.reject()
                    }
                })
                .catch( () => Promise.reject('ID de categoría inexistente'))
        }),
    check('description')
        .exists().withMessage('El campo es obligatorio')
        .notEmpty().withMessage('La descripción es requerida').bail()
        .isLength({
            min : 20
        }).withMessage('Mínimo 20 caracteres'),

]