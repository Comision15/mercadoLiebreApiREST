const {validationResult} = require('express-validator');
const {loadUsers, storeUsers} = require('../data/dbModule');
const {hashSync} =require('bcryptjs');
const db = require('../database/models');
const { sendSequelizeError } = require('../helpers');
const { literal } = require('sequelize');
const path = require('path');

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
                    include : [[literal(`CONCAT('${req.protocol}://${req.get('host')}/users/image/',avatar)`),'avatarURL']]
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

    setProfile : (req,res) => {

      
    },

    remove : (req,res) =>{

    }
}