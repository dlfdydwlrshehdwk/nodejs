const router = require('express').Router()

const { ObjectId } = require('mongodb');
const connectDB = require('./../database.js') 

let db;
connectDB.then((client)=>{
  db = client.db('todoapp')
}).catch((err)=>{
  console.log(err)
})


// detail 상세페이지 접속시
router.get('/:id',async (요청,응답)=>{ // : 뒤엔 아무렇게 작명 // /detail/아무문자 가 들어오면 이게 실행
  let params = 요청.params.id // : 뒤에오는 id부분
  // console.log(params,await db.collection('post').findOne({ _id : new ObjectId(params)}))
  try {
    let result = await db.collection('post').findOne({ _id : new ObjectId(params) })
    // 예외처리 result가 없다면
    if(result == null) { // try catch만으로는 예외처리를 다 할 수가없기에 테스트를 해보고 예외처리를 하는게 중요
      응답.status(404).send(result)
    }
    응답.render('detail.ejs',{result : result})
  } catch(err) {
    응답.status(404).send('에러')
  }
})
  

module.exports = router
