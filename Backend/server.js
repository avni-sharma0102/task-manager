const server = require("./src/app")
const connectDB = require("./src/db/db")

server.listen(3000,()=>{
    console.log("Server is running...")
})


connectDB() 