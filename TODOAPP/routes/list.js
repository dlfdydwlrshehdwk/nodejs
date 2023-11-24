const router = require('express').Router()
const connectDB = require('./../database.js')
let db;
connectDB.then((client)=>{
  db = client.db('todoapp')
}).catch((err)=>{
  console.log(err)
})

router.get('/', async (요청,응답) => {
  let result = await db.collection('post').find().toArray()
  let login = 요청.user
  응답.render('list.ejs' , {글목록 : result, 글수 : result.length, login : login})
})

router.get('/:id', async (요청,응답) => {
  try {
    let nowPage = 요청.params.id;
    let skip = (요청.params.id - 1) * 5 ;
    let limit = 5;
    let result = await db.collection('post').find().skip(skip).limit(limit).toArray();
    let data = await db.collection('post').find().toArray()
    console.log(요청.body,요청.params)
    응답.render('list.ejs' , {글목록 : result , params : 요청.params.id, 글수 : data.length, 현재페이지 : nowPage})
  } catch {
    응답.status(500).send('오류')
  }
})


module.exports = router