const router = require('express').Router()

let connectDB = require('./../database.js')

let db;
connectDB.then((client)=>{
  db = client.db('todoapp')
}).catch((err)=>{
  console.log(err)
})

router.post('/', async (요청,응답) => {
  let isUser = await db.collection('user').findOne({ username : 요청.body.username})
  let overlapping = isUser == null
  let alert;
  if(요청.body.username == ''){
    alert = '아이디를 입력해주세요'
  } else if(overlapping) {
    alert = '사용가능한 아이디입니다.'
  } else {
    alert = '중복된 아이디입니다.'
  }
  응답.send(alert)
})

module.exports=router