// 이 두줄은 익스프레스 라이브러리를 사용하겠다 라는소리
const express = require('express')
const app = express()

app.use(express.static(__dirname + '/public')) // 폴더를 server.js에 등록해야 폴더안의 파일들 html에서 사용가능 .css .js .jpg 이런파일을 static파일이라고함

// 몽고디비 라이브러리 셋팅
const { MongoClient } = require('mongodb')

let db
const url = 'mongodb사이트에 있던 님들의 DB 접속 URL'
new MongoClient(url).connect().then((client)=>{
  console.log('DB연결성공')
  db = client.db('forum')
}).catch((err)=>{
  console.log(err)
})

// 8080서버를 엶
app.listen(8080, () => {
  console.log('8080')
})

// 라우팅
app.get('/',(요청,응답) => { // 메인페이지 접속시
  // 응답.send('메인입니다.') // 단순 글씨만 보낼떄
  응답.sendFile(__dirname + '/index.html') // html파일을 보낼때
})

app.get('/news',(요청,응답) => { // /news 접속시
  응답.send('오늘 비옴')
})