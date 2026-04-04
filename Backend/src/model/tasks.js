const mongoose = require('mongoose')

let taskSchema = mongoose.Schema({
    taskname:{
        type:String,
        required:true
    },
    priority:{
        type:String,
        enum:["High","medium" , "low"],
        required:true
    },
    status:{
        type:String,
        enum:["Pending","Completed" , "In progress"],
        default:"In progress"
    },
    duedate:{
        type:Date
    },
    user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
    }
})

let task = mongoose.model('task' , taskSchema)

module.exports = task;