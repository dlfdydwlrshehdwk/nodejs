const router = require('express').Router()

let connectDB = require('./../database.js')

let db;
connectDB.then((client)=>{
  // 디비연결이 되었을때
  console.log('DB연결성공')
  db = client.db('todoapp')
}).catch((err)=>{
  // 디비연결에 실패하였을때
  console.log(err)
})
router.get('/pants', async (요청,응답)=>{
  await db.collection('post').find().toArray()
  
  응답.send('바지페이지')
})
router.get('/shirts',(요청,응답)=>{
  응답.send('셔츠페이지')
})
// 에러나니 내일더하셈
module.exports = router