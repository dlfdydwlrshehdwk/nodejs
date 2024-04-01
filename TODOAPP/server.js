<<<<<<< HEAD
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
=======
// 이 두줄은 익스프레스 라이브러리를 사용하겠다 라는소리
const express = require('express')
const app = express()
const methodOverride = require('method-override') // 메소드 오버라이드 쓰겠다는소리
const bcrypt = require('bcrypt') // bcrypt 쓰겠다는 소리
const MongoStore = require('connect-mongo') // connect-mongo 쓰겠다는 소리 

require('dotenv').config() // env파일 쓰겠다는 소리
// passport 라이브러리 셋팅 s//
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')

app.use(passport.initialize())
app.use(session({
  secret: '암호화에 쓸 비번',
  resave : false, // 유저가 서버로 요청할때마다 세션 갱신할건지 default : false
  saveUninitialized : false, // 로그인 안해도 세션 만들것인지 default : false
  cookie : { maxAge : 60 * 60 * 1000}, // 쿠키유지시간
  store : MongoStore.create({
    mongoUrl : process.env.DB_URL,
    dbName : 'todoapp'
  })
}))
app.use(passport.session()) 
// passport 라이브러리 셋팅 e// 

// multer 사용하겠다는 소리
// const { S3Client } = require('@aws-sdk/client-s3')
// const multer = require('multer')
// const multerS3 = require('multer-s3')
// const s3 = new S3Client({
//   region : 'ap-northeast-2',
//   credentials : {
//       accessKeyId : process.env.S3_KEY,
//       secretAccessKey : process.env.S3_SECRET
//   }
// })

// const upload = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: 'dotlqksk',
//     key: function (요청, file, cb) {
//       cb(null, Date.now().toString()) //업로드시 파일명 변경가능
//       // 겹치는걸 피하기위해 날짜같은걸 넣는다고함
//       // 파일명같은걸 넣고싶다면 요청.file 하면 나온다고함.
//     }
//   })
// })
// 사진한장받아올때 upload.single('img1') , 파일명은 요청.file안에있음
// 사진여러장받아올때 upload.array('인풋name' , 2(최대장수) ) , 파일명은 요청.files 
// 그럼 location 안에 있는 주소가 img src이다. 요청.file.location
// 함수를 미들웨어로 사용해도 되고 에러처리를하려면 API안에서 함수호출하는것이 좋다
// ex ) upload.single('인풋name')(요청,응답,(err)=>{
//    if(err) return 응답.send('업로드에러')
// }) 대충이런느낌 조건문안에서 try catch하는 느낌으로다가


app.use(methodOverride('_method')) // 메소드 오버라이드 쓰겠다는 소리
app.use(express.static(__dirname + '/assets')) // 폴더를 server.js에 등록해야 폴더안의 파일들 html에서 사용가능 .css .js .jpg 이런파일을 static파일이라고함
app.set('view engine','ejs') // ejs 사용할거임

// 요청.body - 유저가 form태그로 보낸 데이터인데 이거 꺼내오는게 상당히 귀찮은데 이걸 쉽게해주는 코드2줄 ( 이걸 셋팅해놔야 요청.body 사용가능 )
app.use(express.json())
app.use(express.urlencoded({extended:true})) 

// 원래 db설정
// 몽고디비 라이브러리 셋팅
// const { MongoClient, ObjectId } = require('mongodb')
// const url = process.env.DB_URL

// let db
// new MongoClient(url).connect().then((client)=>{
  //   // 디비연결이 되었을때
  //   console.log('DB연결성공')
  //   db = client.db('todoapp')
  // }).catch((err)=>{
    //   // 디비연결에 실패하였을때
    //   console.log(err)
    // })
    
  // database.js 에 db를 따로 빼서 사용
  const { MongoClient, ObjectId } = require('mongodb')
  let connectDB = require('./database')
  let db;
  connectDB.then((client)=>{
    console.log('db연경성공')

    db = client.db('todoapp')
    // 8080서버를 엶
    app.listen(process.env.PORT, () => {
      console.log('8080')
    })
  })
  .catch((err)=>{
    console.log(err)
  })
  
  
  // // 8080서버를 엶 - db가 연동되었을때만 열기위해 db연동일때 서버를 열게끔함
  // app.listen(process.env.PORT, () => {
  //   console.log('8080')
  // })



  // 라우팅
  // app.get('/',(요청,응답) => { // 메인페이지 접속시
  //   // 응답.send('메인입니다.') // 단순 글씨만 보낼떄
  //   응답.sendFile(__dirname + '/index.html') // html파일을 보낼때
  // })
  app.get('/', async (요청,응답) => {
    let result = 요청.user
    응답.render('index.ejs',{login : result})
  } )

  
  

  // // add 글 추가하는 API
  // app.post('/add', async (요청,응답) => {
  //   let database = await db.collection('post')
  //   // upload.single() 안에 들어가는애랑 form태그에서 넣는 name값과 일치해야 됨!
  //   upload.single('img1')(요청,응답,(err)=>{
  //     // 이미지업로드에 에러가 걸릴때.
  //     // console.log(요청.file)
  //     if(err) return 응답.send(err)
  //     // 간혹 서버에 문제가 생길 수 있으니 try catch문으로 처리 try - 잘되면 , catch - 안됐을때
  //     try {
  //       // 예외처리 - 빈칸으로 전송한다던가 할때 ( 여러상황을 예외처리하는게 좋음 , js로 예외처리를 할 수 있으나 코드는 조작이 가능하니 최종은 서버에서 한다. )
  //       if ( 요청.body.title == '' ) {
  //         응답.send('제목을 입력하세요')
  //       } else {
  //         let data = {
  //           title : 요청.body.title, 
  //           content : 요청.body.content,
  //           image : 요청.file.location ? 요청.file.location : null
  //         }
  //         database.insertOne(data)
  //         응답.redirect('/list') // 다른페이지로 이동시켜줌
  //       }
  //     } catch(e) {
  //       // console.log(e) // 에러의 이유
  //       응답.status(500).send('서버에러' + e) 
  //     } 
  //   })
      
  // })

  // edit 수정페이지 접속시
  app.get('/edit/:id', async (요청,응답) => {
    try {

      
      let result = await db.collection('post').findOne({ _id : new ObjectId(요청.params.id) })
      응답.render('edit.ejs',{result : result})
    } catch {
      응답.status(500).send('서버에러')
    }
  })
  
  // delete 글 삭제
  app.delete('/delete', async (요청,응답) => {
    let result = await db.collection('post').deleteOne( { _id : new ObjectId(요청.query.docid)})
    응답.send('삭제완료')
  })
  // search 검색페이지 접속시
  app.post('/search', async (요청,응답) => {
    try {
      let tg = 요청.body.search_slct;
      let result;
      switch(tg) {
        case "전체" : result = await db.collection('post').find({
          // or 쿼리를 사용해서 여러 곳에서 데이터 가져오기
          $or : [
            // $regex 를 이용해서 단어의 일부분만 입력해도 가져오기
            {title : { $regex : 요청.body.search_inp}},
            {content : { $regex : 요청.body.search_inp}}
          ]
        }).toArray() ; break;
        case "글제목" : result = await db.collection('post').find({title : { $regex : 요청.body.search_inp}}).toArray() ; break;
        case "글내용" : result = await db.collection('post').find({content : { $regex : 요청.body.search_inp}}).toArray() ; break;
      }
      
      응답.render('search.ejs',{result : result})
    } catch (e) {
      응답.status(500).send(e)
    }
  })
  // mypage 마이페이지 접속시
  app.get('/mypage', async (요청,응답) => {
    let login = 요청.user
    if(요청.user == undefined) 응답.redirect('/')
    else {
      try{
        
        응답.render('mypage.ejs',{ login : login})
      } catch(err) {
        응답.status(500).send(err)
      }
    }
  })
  // register 회원가입 페이지 접속시 get
  app.get('/register', async(요청,응답) => {
    let login = 요청.user
    응답.render('register.ejs',{login : login})
  })
 
  // register 회원가입 페이지 post요청
  app.post('/register', async (요청,응답) => {
    // 중복아이디 체크
    let isUser = await db.collection('user').findOne({ username : 요청.body.username})
    let overlapping = isUser == null // true면 db에 중복아이디가 없다는것.
    // 예외처리 필요
    if(overlapping){ // id 중복체크통과
      console.log(요청.body)
      // 비밀번호와 비밀번호 확인 맞는지 체크
      if(요청.body.password == 요청.body.password_chk){
        try {
          // await bcrypt.hash('문자',10) // 문자를 해싱해주고 10글자로 꼬아줌
          let hash = await bcrypt.hash(요청.body.password , 10)
      
          await db.collection('user').insertOne({
            username : 요청.body.username,
            password : hash
          })
          응답.redirect('/login')
        } catch {
          응답.status(500).send('서버에러')
        }
      } else {
        응답.redirect('/')
      }
    } else {
      응답.redirect('/')
    }
  })
  // 비밀번호를 해싱(암호화) 하기위해 bcrypt 라는 라이브러리 설치
  // npm install bcrypt 
  // 셋팅 const bcrypt = require('bcrypt')


  

  // form태그에서 put이나 delete사용가능
  // npm install method-override - 인스톨코드
  // 셋팅코드
  // const methodOverride = require('method-override')
  // app.use(methodOverride('_method'))
  // 사용시 action ="/edit?_method=PUT" method="POST"  /요청URL 뒤에 ?_method=PUT

  // 패스포트 라이브러리 사용법 
  // new Localstrategy 어쩌구가 아이디 / 비번이 db와 일치한지 검증하는 로직 짜는 공간
  // 실행하는방법은 API안에서 passport.authenticate('local')() 이런코드 작성하면 된다고 함 + 이 코드 하단에 API들을 만들어야 그 API들은 로그인관련 기능들이 잘 작동한다고 함
  passport.use(new LocalStrategy(async (입력한아이디, 입력한비번, cb) => {
    let result = await db.collection('user').findOne({ username : 입력한아이디}) // 디비에 유저네임 있는지 확인
    if (!result) { // 없으면...
      return cb(null, false, { message: '아이디 DB에 없음' })
    }

    await bcrypt.compare(입력한비번, result.password) // bcrypt문법 왼쪽에 있는애를 해싱해서 오른쪽파라미터와 비교해서 boolean값 줌
    // if (result.password == 입력한비번) { // 아이디있으면 비번이랑 비교
    if (await bcrypt.compare(입력한비번, result.password)) { // 아이디있으면 비번이랑 비교
      return cb(null, result)
    } else { // 일치 하지 않으면
      return cb(null, false, { message: '비번불일치' });
    }
  }))
  
  // 요청.login() 쓰면 자동실행
  passport.serializeUser((user,done)=>{
    // console.log(user) 로그인할때의 정보가 user에 들어감
    process.nextTick(()=>{
      done(null , {id : user._id , username : user.username} ) // 두번째 파라미터는 세션document에 기록됨
    })
  })
  // 유저가 보낸 쿠키 분석
  // 이 코드 밑에서 API작성하면 요청.user 로 정보 볼 수 있다고함
  passport.deserializeUser( async (user, done) => {
    let result = await db.collection('user').findOne({_id : new ObjectId(user.id)})
    process.nextTick(() => {
      return done(null, result)
    })
  })
  // 세션을 db에 저장하려면 connect-mongo 라이브러리깔기
  // npm install connect-mongo
  // 셋팅 const MongoStore = require('connect-mongo)
  // app.use(session) 에 추가해주기
  // store : MongoStore.create({ mongoUrl : 'db접속용url' , dbName : db이름}
  
  // login에서 post요청 했을때
  app.post('/login',async (요청,응답,next) => {
    // error - 에러시 뭐 들어옴 , user - 아이디/비번 검증 완료된 유저정보가 들어옴 , info - 아이디/비번 검증 실패시 에러메시지가 들어옴 
    passport.authenticate('local', (error, user, info) => {
      console.log(error,user,info)
      // 에러처리
      if(error) return 응답.status(500).json(error)
      if(!user) return 응답.status(401).json(info.message)
       // 요청.logIn 실행하면 세션 만들어줌
      요청.logIn(user, (error) => {
        if (error) return next(error)
        
        응답.redirect('/') // 로그인 완료시 실행할 코드
     })
     })(요청, 응답, next)
  })

  // 라우터 테스트 잘됨 - shop.js
  app.use('/shop',require('./routes/shop.js'))
  // Router 
  app.use('/',require('./routes/index.js'))
  app.use('/list',require('./routes/list.js'))
  app.use('/login',require('./routes/login.js'))
  app.use('/overlapping',require('./routes/overlapping.js'))
  app.use('/write',require('./routes/write.js'))
  app.use('/edit',require('./routes/edit.js'))
  app.use('/detail',require('./routes/detail.js'))
  app.use('/add',require('./routes/add.js'))
// 해봐야할거 
// 1. pagenation - 대충됨... 
// 2. 정렬기능 - 생각해보니 정렬이 필요할까? 
// 3. 검색 - 검색페이지를 하나 만들어서 - 대충완성
// 4. 회원가입 - 아이디 중복 막기 - ㅇㅋ
// 5. 회원가입 - 비밀번호 확인 만들기 - 대충 ㅇㅋ 아아디나 비번 조건은 정규식처리
// 6. 서버에서 회원가입 거르기 - 대충 윤곽만 잡아놈
// 7. 로그인 한 사람만 글작성가능 - 조금 귀찮아서 나중에
// ㄴ ejs에선 locals.login으로 dn처리해주고 서버에서도 쿠키확인해서 해야할듯
// 그 이전에 모든페이지에 로그인아닌데 뭐 하려고하면 세션종료 팝업 만들던가 하면 좋을듯. 
// 8. 글삭제 본인만 가능  - 조금만 나중에
// 9. 관리자 기능? - 조금만 나중에
// 10. env파일에 환경변수 옮기기 - 했어
// 11. 자주필요할 함수 ex) 요청.user 같은거 미들웨어 화 하기
// 12. 이미지넣고 이미지있을땐 보여주기 - ㅇㅋ
// 13. 각 API들 라우터 분리하기 - 영상보고 완료는해놨음 정리하고 다른데도 나눠보면 좋을듯
// 14. aws서버에 노드js올리는거부터 하고있었음
>>>>>>> fa43e2cc290a878f96c43d4d7500ef87cc110d91
