let express = require("express")
let tasks = require("./model/tasks")
let user = require('./model/user')


let app = express()
app.use(express.json())

app.post("/register" , async (req,res)=>{
    try{
        const {username , email , password} = req.body

        if(!username || !password || !email)
        {
            return res.status(400).json({
                message:"please fill all datails"
            })
        }
        const existUser = await user.findOne({email})
        if(existUser)
        {
            return res.status(400).json({
                message:"User already exists"
            })
        }

        const newUser = await user.create({
            username,
            email,
            password

        }) 

        return res.status(201).json({
            message:"Registered successfully !!",
            user:newUser
        })

    }
    catch(err){
        res.status(500).json({
            message: err.message
        })
    }
})

app.post("/login" , async (req , res)=>{

    try{
        const {email , password} = req.body

        if(!email || !password)
        {
            return res.status(400).json({
                "message":"please fill all the details"
            })
        }
        const existUser = await user.findOne({ email })

        if(!existUser)
        {
            return res.status(400).json({
                "message":"Email not found"
            })
        }
        let ps = password.toString()
        let ups = existUser.password.toString()

        if(!(ps === ups))
        {
            res.status(400).json({
                "message":"Incorrect Password !!"
            })
        }
        return res.status(200).json({
            "message":"Log in Successful !!"
        })
    }

    catch(err)
    {
        return res.status(500).json({
            message:err.message
        })
    }
})


app.get("/" , (req,res)=>{
    res.send("Backend is active...")
})

module.exports = app;