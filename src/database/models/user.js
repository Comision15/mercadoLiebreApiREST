'use strict';
const fs = require('fs');
const {hashSync} = require('bcryptjs');
const moment = require('moment');
const {validationsModelsDefault,objectValidate, createError} =require('../../helpers')

const {
  Model
} = require('sequelize');
const path = require('path');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {

    emailVerify(value) {
      return new Promise(resolve => {
          const user = User.findOne({
            where : {
              email : value
            }
          });
          resolve(user)
      })
    }
  
    static associate(models) {
      // define association here
      User.belongsTo(models.Rol,{
        as :'rol',
        foreignKey : 'rolId'
      });

      User.belongsTo(models.Gender, {
        as : 'gender',
        foreignKey : 'genderId'
      });

      User.hasMany(models.Address, {
        as : 'address',
        foreignKey : 'userId'
      });

      User.hasMany(models.Order,{
        as : 'orders',
        foreignKey : 'userId'
      })
    }
  }
  User.init({
    name: {
      type : DataTypes.STRING,
      allowNull : false,
      validate : {
        is : objectValidate(/^[a-zA-Zñíóúáéí\s]+$/i,"Solo se aceptan caracteres alfabéticos"),
        ...validationsModelsDefault,
      }
    },
    surname: {
      type : DataTypes.STRING,
      allowNull : false,
      validate : {
         is : objectValidate(/^[a-zA-Zñíóúáéí\s]+$/i,"Solo se aceptan caracteres alfabéticos"),
         ...validationsModelsDefault,
      }
    },    
    email: {
      type : DataTypes.STRING,
      allowNull : false,
      unique : true,
      validate : {
        ...validationsModelsDefault,
        isEmail : objectValidate(true,"El email no tiene un formato válido"),
        async email(value){
            const user = await this.emailVerify(value);
            if(user){
              throw createError(404, "El email ya se encuentra registrado")
            }
        }
      }
    },
    password: {
      type : DataTypes.STRING,
      allowNull : false,
      validate : {
        ...validationsModelsDefault,
        is : objectValidate(/^(?=\w*\d)(?=\w*[A-Z])(?=\w*[a-z])\S{6,12}$/,'La contraseña debe tener un mayúscula, una minuscula, un caracter especial y entre 6 y 12 caracteres'),
        hashPass(value){
          User.beforeCreate( (user) =>{
            user.password = hashSync(value,10)
          })
        }
    
      }
    },
    birthday: {
      type : DataTypes.DATE,
      validate : {
        checkDate(value){
          if(moment(value).isAfter(moment())){
            throw createError(404, 'La fecha no puede ser posterior a la actual')
          } // true
        }
      }
    },
    avatar : {
      type : DataTypes.STRING,
      defaultValue : "default.png",
      validate : {
        isImage(value){
          if(!/.png|.jpg|.jpeg|.webp/i.test(value)){
            
            fs.unlinkSync(path.join(__dirname,'..','..','..','public','images','users',value))

            throw createError(404, 'El archivo no es un imágen')
          }
        }
      }
    },
    genderId: {
      type: DataTypes.INTEGER,
      defaultValue : 3
    },
    rolId: {
      type : DataTypes.INTEGER,
      defaultValue : 2
    }
  }, {
    sequelize,
    modelName: 'User',
    paranoid : true
  });
  return User;
};