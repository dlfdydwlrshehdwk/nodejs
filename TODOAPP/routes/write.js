const router = require('express').Router()
const connectDB = require('./../database.js')
let db;

connectDB.then((client)=>{
  db = client.db('todoapp')
}).catch((err)=>{
  console.log(err)
})

// write 글쓰기 페이지 접속시 
router.get('/',(요청,응답) => {
  let login = 요청.user
  응답.render('write.ejs',{login : login})
})

module.exports = router