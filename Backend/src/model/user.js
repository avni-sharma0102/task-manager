const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
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
}, { timestamps: true })

let user = mongoose.model('user' , userSchema)

module.exports = user;