const mongoose = require('mongoose')

let taskSchema = mongoose.Schema({
    taskname:{
        type:String,
        required:true
    },
    priority:{
        type:String,
        enum:["High","Medium","Low"],
        required:true
    },
    status:{
        type:String,
        enum:["Pending","Completed","In Progress"],
        default:"In Progress"
    },
    duedate:{
        type:Date
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

let task = mongoose.model('task' , taskSchema)

module.exports = task;