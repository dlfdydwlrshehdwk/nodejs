// 서버키는법 node server.js - 터미널에

// 서버를 띄우기 위한 기본셋팅(express라이브러리)
const express = require('express');
const app = express();
// bodyparser 사용하기위해 필요한정보 외울필요 x
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended:true}))

// listen(파라미터1,파라미터2) 
// listen(서버띄울포트번호, 띄운 후 실행할코드)
app.listen(8080, function(){
    console.log('listen on 8000')
});

// 누군가 메인 으로 접속하면
// index파일을 띄우자
// sendfile() 파일보내는 함수
// __dirname - 현재 파일의 경로
app.get('/',function(요청,응답){
    응답.sendFile(__dirname + '/index.html')
})

app.get('/write',function(요청,응답){
    응답.sendFile(__dirname + '/write.html')
})

// POST요청 처리 기계를 만들려면 app.post('경로',콜백함수)
// form태그로 전송한 내용은 요청 에 들어가있음
// 이걸 쉽게 빼서 사용하기위해 body-parser 라는걸깔았음
// npm install body-parser
app.post('/add', function(요청,응답){
    응답.send('전송완료')
    console.log(요청.body)
})