const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination : function (req,file,callback) {
        switch (file.fieldname) {
            case "avatar":
                callback(null,'public/images/users')
                break;
            case "images":
                callback(null,'public/images/products')
                break;
            default:
                break;
        }
    
    },
    filename : function (req,file,callback){

        console.log(file)
        switch (file.fieldname) {
            case "avatar":
                callback(null, `${Date.now()}_avatar${path.extname(file.originalname)}`)
                break;
            case "images":
                callback(null, `${Date.now()}_product${path.extname(file.originalname)}`)
                break;
            default:
                break;
        }
    }
});


const fileFilter = (req,file,callback) => {
    if(!/.png|.jpg|.jpeg|.webp/i.test(file.originalname)){
        req.fileValidationError = "El archivo no es una imagen"
        return callback(null, false)
    }
    return callback(null, true)
};

const uploadUser = multer({
    storage 
})

const uploadProduct = multer({
    storage,
    fileFilter
})

module.exports = {
    uploadUser,
    uploadProduct
}