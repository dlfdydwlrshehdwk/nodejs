// 이 두줄은 익스프레스 라이브러리를 사용하겠다 라는소리
const express = require('express')
const app = express()

app.use(express.static(__dirname + '/public')) // 폴더를 server.js에 등록해야 폴더안의 파일들 html에서 사용가능 .css .js .jpg 이런파일을 static파일이라고함
app.set('view engine','ejs') // ejs 사용할거임

// 몽고디비 라이브러리 셋팅
const { MongoClient } = require('mongodb')

let db
const url = 'mongodb+srv://admin:qwer1234@cluster0.gr6juzz.mongodb.net/?retryWrites=true&w=majority'
new MongoClient(url).connect().then((client)=>{
  // 디비연결이 되었을때
  console.log('DB연결성공')
  db = client.db('todoapp')

  // 8080서버를 엶
  app.listen(8080, () => {
    console.log('8080')
  })

  // 라우팅
  app.get('/',(요청,응답) => { // 메인페이지 접속시
    // 응답.send('메인입니다.') // 단순 글씨만 보낼떄
    응답.sendFile(__dirname + '/index.html') // html파일을 보낼때
  })

  app.get('/list', async (요청,응답) => { // /news 접속시
    // db.collection('post').insertOne({title : '타이틀'})
    let result = await db.collection('post').find().toArray() // db에서 모든데이터 가져오는 코드 awiat이 필수라 위에 함수에 async또한 필수
    // db.collection('post').find().toArray().then(()=>{}) // awiat 쓰기 싫다면 then으로 활용가능
    console.log(result)
    응답.render('list.ejs' , {글목록 : result})
  })

  app.get('/time', (요청,응답)=>{
    응답.render('time.ejs',{시간 : new Date()})
  })


}).catch((err)=>{
  // 디비연결에 실패하였을때
  console.log(err)
})

