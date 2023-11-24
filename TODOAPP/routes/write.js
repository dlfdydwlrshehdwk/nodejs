const router = require('express').Router()
const connectDB = require('./../database.js')
let db;
connectDB.then((client)=>{
  db = client.db('todoapp')
}).catch((err)=>{
  console.log(err)
})


module.exports = router