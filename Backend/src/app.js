let express = require("express")
let tasks = require("./model/tasks")
let user = require('./model/user')
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const auth = require("./Middleware/auth");

let app = express()

app.use(cors({
  origin: "*",
  credentials: true
}));

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

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await user.create({
            username,
            email,
            password: hashedPassword 
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
                message:"please fill all the details"
            })
        }

        const existUser = await user.findOne({ email })

        if(!existUser)
        {
            return res.status(400).json({
                message:"Email not found"
            })
        }

        const isMatch = await bcrypt.compare(password, existUser.password);
        if (!isMatch) {
          return res.status(400).json({ message: "Incorrect password" });
        }

        const token = jwt.sign(
          { userId: existUser._id },
          "SECRET_KEY",
          { expiresIn: "1d" }
        );

        return res.status(200).json({
            message:"Login Successful !!",
            token
        })
    }

    catch(err)
    {
        return res.status(500).json({
            message:err.message
        })
    }
})

app.post("/tasks", auth, async (req, res) => {
  try {
    const { taskname, priority } = req.body;

    const task = await tasks.create({
      taskname,
      priority,
      userId: req.userId 
    });

    res.status(201).json(task);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/tasks", auth, async (req, res) => {
  try {
    const allTasks = await tasks.find({ userId: req.userId });

    res.json(allTasks);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/tasks/:id", auth, async (req, res) => {
  try {
    const { taskname, priority, status, duedate } = req.body;

    const updatedTask = await tasks.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId
      },
      { taskname, priority, status, duedate },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({
        message: "Task not found or not authorized"
      });
    }

    res.json({
      message: "Task updated successfully",
      updatedTask
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const deletedTask = await tasks.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId  
    });

    if (!deletedTask) {
      return res.status(404).json({
        message: "Task not found or not authorized"
      });
    }

    res.json({
      message: "Task deleted successfully"
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/" , (req,res)=>{
    res.send("Backend is active...")
})

module.exports = app;