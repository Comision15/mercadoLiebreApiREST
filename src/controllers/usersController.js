const {validationResult} = require('express-validator');
const {loadUsers, storeUsers} = require('../data/dbModule');
const {hashSync} =require('bcryptjs');
const db = require('../database/models');
const { sendSequelizeError } = require('../helpers');
const { literal } = require('sequelize');
const path = require('path');
const fs = require('fs');

module.exports = {

    getAvatar : (req,res) => {
        return res.sendFile(path.join(__dirname, '..','..','public','images','users', req.params.avatar ))
    },

    getProfile : async (req,res) => {

        try {

            const {id} =req.userToken;

            const options = {
                attributes : {
                    exclude : ['password', 'createdAt','updatedAt', 'deletedAt', 'id'],
                    include : [[literal(`CONCAT('${req.protocol}://${req.get('host')}/users/avatar/',avatar)`),'avatarURL']]
                },
                include : [
                    {
                        association : 'rol',
                        attributes : ['name']
                    },
                    {
                        association : 'gender',
                        attributes : ['name']
                    },
                    {
                        association : 'address',
                        attributes : {
                            exclude : ['createdAt','updatedAt', 'deletedAt', 'id']
                        }
                    }
                ]
            }

            let user = await db.User.findByPk(id, options);

            return res.status(200).json({
                ok : true,
                status : 200,
                data : user
            })
            
        } catch (error) {

            let errors = sendSequelizeError(error);
            return res.status(error.status || 500).json({
                ok: false,
                errors,
            });
        }
        
   
    },

    setProfile : async (req,res) => {

        try {

            const {id} =req.userToken;

            const {
                name,
                surname,
                email,
                password,
                street,
                city,
                province,
                birthday,
                genderId
            } = req.body;

            const options = {
                attributes : {
                    exclude : ['password', 'createdAt','updatedAt', 'deletedAt'],
                    include : [[literal(`CONCAT('${req.protocol}://${req.get('host')}/users/avatar/',avatar)`),'avatarURL']]
                },
                include : [
                    {
                        association : 'rol',
                        attributes : ['name']
                    },
                    {
                        association : 'gender',
                        attributes : ['name']
                    },
                    {
                        association : 'address',
                        attributes : {
                            exclude : ['createdAt','updatedAt', 'deletedAt']
                        }
                    }
                ]
            }

            let user = await db.User.findByPk(id, options);
            let avatar = user.avatar;

            user.name = name ? name.trim() : user.name;
            user.surname = surname ? surname.trim() : user.surname;
            user.email = email ? email.trim() : user.email;
            user.password = password ? password.trim() : user.password;
            user.birthday = birthday ? birthday : user.birthday;
            user.avatar = req.file ? req.file.filename : user.avatar;
            user.genderId = genderId ? genderId : user.genderId;

            const address = user.address[0];

            address.street = street ? street.trim() : address.street;
            address.city = city ? city.trim() : address.city;
            address.province = province ? province.trim() : address.province;
        

            await user.save();
            await address.save();

             if(req.file && user.avatar !== "default.png" && user.avatar !== avatar){
                fs.existsSync(path.join(__dirname,'..','..','public','images','users',avatar)) && fs.unlinkSync(path.join(__dirname,'..','..','public','images','users',avatar))
            }

            return res.status(201).json({
                ok : true,
                status : 200,
                data : user
            })

            
        } catch (error) {
            let errors = sendSequelizeError(error);

            if(req.file){
                fs.existsSync(path.join(__dirname,'..','..','public','images','users',req.file.filename)) && fs.unlinkSync(path.join(__dirname,'..','..','public','images','users',req.file.filename))
            }

            return res.status(error.status || 500).json({
                ok: false,
                errors,
            });
        }
      
    },

    remove : async (req,res) => {

        try {
            
        } catch (error) {
            let errors = sendSequelizeError(error);

            return res.status(error.status || 500).json({
                ok: false,
                errors,
            });
        }

    }
}