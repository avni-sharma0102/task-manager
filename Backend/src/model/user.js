const mongoose = require('mongoose')

let userSchema = mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password:{
        type:String,
        required:true
    }
})

let user = mongoose.model('user' , userSchema)

module.exports = user;