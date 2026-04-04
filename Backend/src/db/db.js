const mongoose = require('mongoose')
const dns = require('dns')

dns.setServers(['1.1.1.1','8.8.8.8']);
dns.setDefaultResultOrder('ipv4first');

async function connectDB()
{
  try{
    await mongoose.connect('mongodb+srv://Admin:T561vGcYGYjG3hs6@cluster0.96nkylx.mongodb.net/task_manager')
    console.log("DB is connected")
  }
  catch(error)
  {
    console.log(error)
  }
}
module.exports = connectDB