const {hashSync} =require('bcryptjs');
const db = require('../database/models');
const {sendSequelizeError} = require('../helpers');
const {sign} = require('jsonwebtoken');

module.exports = {
    processRegister : async (req,res) => {
       try {
            const {name, surname, email, password} = req.body;

            const {id, rolId} = await db.User.create({
                name: name && name.trim(),
                surname: surname && surname.trim(),
                email : email && email.trim(),
                password : password && password.trim(),
                rolId : 2
            });

            const token = sign(
                {
                    id, 
                    rolId
                },
                    process.env.SECRET_KEY_JWT,
                {
                    expiresIn : '1h'
                }
            )

            return res.status(201).json({
                ok : true,
                status : 201,
                data : token
            })

       } catch (error) {
            
        let errors = sendSequelizeError(error);
            return res.status(error.status || 500).json({
                ok : false,
                errors 
            })
       }
    },
    processLogin : (req,res) => {
        let errors = validationResult(req);
        if(errors.isEmpty()){

            let {id, name, avatar} = loadUsers().find(user => user.email === req.body.email);

            req.session.userLogin = {
                id,
                name,
                avatar
            };

            req.body.remember && res.cookie('mercadoLiebre15',req.session.userLogin, {maxAge : 1000 * 60})


            return res.redirect('/');

        }else {
            return res.render('userLogin',{
                errors : errors.mapped(),
                old : req.body
            })
        }
    }
}