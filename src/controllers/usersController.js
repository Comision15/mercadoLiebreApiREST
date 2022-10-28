const {validationResult} = require('express-validator');
const {loadUsers, storeUsers} = require('../data/dbModule');
const {hashSync} =require('bcryptjs');
const db = require('../database/models');

module.exports = {

    getAvatar : async (req,res) => {

    },

    getProfile : (req,res) => {
        
   
    },
    setProfile : (req,res) => {

      
    },
    remove : (req,res) =>{

    }
}