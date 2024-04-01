const router = require('express').Router()
const upload = require('./../upload')
const connectDB = require('./../database.js') 
let db;
connectDB.then((client)=>{
  db = client.db('todoapp')
}).catch((err)=>{
  console.log(err)
})

 // add 글 추가하는 API
 router.post('/', async (요청,응답) => {
  let database = await db.collection('post')
  // upload.single() 안에 들어가는애랑 form태그에서 넣는 name값과 일치해야 됨!
  upload.single('img1')(요청,응답,(err)=>{
    // 이미지업로드에 에러가 걸릴때.
    // console.log(요청.file)
    if(err) return 응답.send(err)
    // 간혹 서버에 문제가 생길 수 있으니 try catch문으로 처리 try - 잘되면 , catch - 안됐을때
    try {
      // 예외처리 - 빈칸으로 전송한다던가 할때 ( 여러상황을 예외처리하는게 좋음 , js로 예외처리를 할 수 있으나 코드는 조작이 가능하니 최종은 서버에서 한다. )
      if ( 요청.body.title == '' ) {
        응답.send('제목을 입력하세요')
      } else {
        let data = {
          title : 요청.body.title, 
          content : 요청.body.content,
          image : 요청.file.location ? 요청.file.location : null
        }
        database.insertOne(data)
        응답.redirect('/list') // 다른페이지로 이동시켜줌
      }
    } catch(e) {
      // console.log(e) // 에러의 이유
      응답.status(500).send('서버에러' + e) 
    } 
  })
    
})


module.exports = router