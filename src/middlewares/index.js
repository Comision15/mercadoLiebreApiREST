const { uploadProduct, uploadUser } = require('./uploadFile')

module.exports = {
    localsUserCheck : require('./localsUserCheck'),
    userCheck : require('./userCheck'),
    cookieCheck : require('./cookieCheck'),
    checkToken : require('./checkToken'),
    uploadProduct,
    uploadUser
}
