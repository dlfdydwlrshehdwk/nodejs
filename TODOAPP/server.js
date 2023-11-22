// 이 두줄은 익스프레스 라이브러리를 사용하겠다 라는소리
const express = require('express')
const app = express()
const methodOverride = require('method-override') // 메소드 오버라이드 쓰겠다는소리
const bcrypt = require('bcrypt') // bcrypt 쓰겠다는 소리
const MongoStore = require('connect-mongo') // connect-mongo 쓰겠다는 소리 

// passport 라이브러리 셋팅 s//
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')

app.use(passport.initialize())
app.use(session({
  secret: '암호화에 쓸 비번',
  resave : false, // 유저가 서버로 요청할때마다 세션 갱신할건지 default : false
  saveUninitialized : false, // 로그인 안해도 세션 만들것인지 default : false
  cookie : { maxAge : 60 * 60 * 1000},
  store : MongoStore.create({
    mongoUrl : 'mongodb+srv://admin:qwer1234@cluster0.gr6juzz.mongodb.net/?retryWrites=true&w=majority',
    dbName : 'todoapp'
  })
}))
app.use(passport.session()) 
// passport 라이브러리 셋팅 e// 

// multer 사용하겠다는 소리
const { S3Client } = require('@aws-sdk/client-s3')
const multer = require('multer')
const multerS3 = require('multer-s3')
const s3 = new S3Client({
  region : 'ap-northeast-2',
  credentials : {
      accessKeyId : process.env.S3_KEY,
      secretAccessKey : process.env.S3_SECRET
  }
})

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'dotlqksk',
    key: function (요청, file, cb) {
      cb(null, Date.now().toString()) //업로드시 파일명 변경가능
      // 겹치는걸 피하기위해 날짜같은걸 넣는다고함
      // 파일명같은걸 넣고싶다면 요청.file 하면 나온다고함.
    }
  })
})
// 사진한장받아올때 upload.single('img1') , 파일명은 요청.file안에있음
// 사진여러장받아올때 upload.array('인풋name' , 2(최대장수) ) , 파일명은 요청.files 
// 그럼 location 안에 있는 주소가 img src이다. 요청.file.location
// 함수를 미들웨어로 사용해도 되고 에러처리를하려면 API안에서 함수호출하는것이 좋다
// ex ) upload.single('인풋name')(요청,응답,(err)=>{
//    if(err) return 응답.send('업로드에러')
// }) 대충이런느낌 조건문안에서 try catch하는 느낌으로다가


app.use(methodOverride('_method')) // 메소드 오버라이드 쓰겠다는 소리
app.use(express.static(__dirname + '/public')) // 폴더를 server.js에 등록해야 폴더안의 파일들 html에서 사용가능 .css .js .jpg 이런파일을 static파일이라고함
app.set('view engine','ejs') // ejs 사용할거임

// 요청.body - 유저가 form태그로 보낸 데이터인데 이거 꺼내오는게 상당히 귀찮은데 이걸 쉽게해주는 코드2줄 ( 이걸 셋팅해놔야 요청.body 사용가능 )
app.use(express.json())
app.use(express.urlencoded({extended:true})) 

// 몽고디비 라이브러리 셋팅
const { MongoClient, ObjectId } = require('mongodb')

let db
const url = "mongodb+srv://admin:qwer1234@cluster0.gr6juzz.mongodb.net/?retryWrites=true&w=majority"
new MongoClient(url).connect().then((client)=>{
  // 디비연결이 되었을때
  console.log('DB연결성공')
  db = client.db('todoapp')
}).catch((err)=>{
  // 디비연결에 실패하였을때
  console.log(err)
})

  // 8080서버를 엶
  app.listen(process.env.PORT, () => {
    console.log('8080')
  })

  // 라우팅
  // app.get('/',(요청,응답) => { // 메인페이지 접속시
  //   // 응답.send('메인입니다.') // 단순 글씨만 보낼떄
  //   응답.sendFile(__dirname + '/index.html') // html파일을 보낼때
  // })
  app.get('/', async (요청,응답) => {
    let result = 요청.user
    응답.render('index.ejs',{login : result})
  } )

  app.get('/list', async (요청,응답) => { // /list 접속시
    // let result = await db.collection('post').find().limit(5).toArray()
    let result = await db.collection('post').find().toArray()
    let login = 요청.user
    응답.render('list.ejs' , {글목록 : result, 글수 : result.length, login : login})
  })

  app.get('/list/:id', async (요청,응답) => {
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
  
  // write 글쓰기 페이지 접속시 
  app.get('/write',(요청,응답) => {
    let login = 요청.user
    응답.render('write.ejs',{login : login})
  })
  // add 글 추가하는 API
  app.post('/add', async (요청,응답) => {
    let database = await db.collection('post')

    upload.single('img1')(요청,응답,(err)=>{
      if(err) return 응답.send(err)
      try {
        console.log(요청.body,요청.file) 
    }  catch {

    }
    })
    // 간혹 서버에 문제가 생길 수 있으니 try catch문으로 처리 try - 잘되면 , catch - 안됐을때
      // try {
      //   // 예외처리 - 빈칸으로 전송한다던가 할때 ( 여러상황을 예외처리하는게 좋음 , js로 예외처리를 할 수 있으나 코드는 조작이 가능하니 최종은 서버에서 한다. )
      //   if ( 요청.body.title == '' ) {
      //     응답.send('제목을 입력하세요')
      //   } else {
      //     let data = {
      //       title : 요청.body.title, 
      //       content : 요청.body.content,
      //       image : 요청.file.location
      //     }
      //     database.insertOne(database)
      //     응답.redirect('/list') // 다른페이지로 이동시켜줌
      //   }
      // } catch(e) {
      //   // console.log(e) // 에러의 이유
      //   응답.status(500).send('서버에러') 
      // } 

  })
  // detail 상세페이지 접속시
  app.get('/detail/:id',async (요청,응답)=>{ // : 뒤엔 아무렇게 작명 // /detail/아무문자 가 들어오면 이게 실행
    let params = 요청.params // : 뒤에오는 id부분
    console.log(params)
    try {
      let result = await db.collection('post').findOne({ _id : new ObjectId(요청.params.id) })
      if(result == null) { // try catch만으로는 예외처리를 다 할 수가없기에 테스트를 해보고 예외처리를 하는게 중요
        응답.status(404).send('없는파일임')
      }
      응답.render('detail.ejs',{result : result})
    } catch {
      응답.status(404).send('없는파일임')
    }
  })
  // edit 수정페이지 접속시
  app.get('/edit/:id', async (요청,응답) => {
    try {

      
      let result = await db.collection('post').findOne({ _id : new ObjectId(요청.params.id) })
      응답.render('edit.ejs',{result : result})
    } catch {
      응답.status(500).send('서버에러')
    }
  })
  // edit 글 수정 API
  app.put('/edit' , async (요청,응답) => {
    
    let data = { title : 요청.body.title , content : 요청.body.content}
    // db.collection('post').updateOne({},{$set : {}}) // 수정하는법 updateOne({바꿀 데이터 ex) id : xx} ,{ $set : { title : 이걸로 }}) 아이디가 이거인것의 title을 이걸로 덮어씀
    await db.collection('post').updateOne({ _id : new ObjectId(요청.body.id) },{$set : data })
    // await db.collection('post').updateOne({_id : x} , {$inc : { like : 1}}) $set은 덮어쓰기 , inc는 뒤에 숫자를 연산해주는 기능 , $mul 곱하기 등등 여러가지있음
    // updateOne은 한개의 도큐먼트만 수정  동시에 여러개 수정하고 싶다면 updateMany 예를들면 좋아요가 10개이상 같은 조건
    // await db.collection('post').updateMany({ like : { $gt : 10} },{$inc : { like : 1}  }) // $gt는 값보다 큰 > 10   등등 여러가지 필터있음

    // 하지만 user에게서 받아오는 id값은 html에 있으면 임의 조작이 가능한데 이럴경우는 어떻게?
    응답.redirect('/list')
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
  app.post('/overlapping', async (요청,응답) => {
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
  // store : MongoStore.create({ mongoUrl : 'db접속용url' , dbName : db이름})

  // /login 접속시 로그인 페이지 보여주기
  app.get('/login', async (요청,응답) => {
    let login = 요청.user;
    응답.render('login.ejs',{login : login})
  })
  
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

// 해봐야할거 
// 1. pagenation - 대충됨... 
// 2. 정렬기능 - 생각해보니 정렬이 필요할까? 
// 3. 검색 - 검색페이지를 하나 만들어서 - 대충완성
// 4. 회원가입 - 아이디 중복 막기 - ㅇㅋ
// 5. 회원가입 - 비밀번호 확인 만들기 - 대충 ㅇㅋ 아아디나 비번 조건은 정규식처리
// 6. 서버에서 회원가입 거르기 - 대충 윤곽만 잡아놈
// 7. 로그인 한 사람만 글작성가능 - 조금 귀찮아서 나중에
// 8. 글삭제 본인만 가능  - 조금만 나중에
// 9. 관리자 기능? - 조금만 나중에
// 10. env파일에 환경변수 옮기기
// 11. 자주필요할 함수 ex) 요청.user 같은거 미들웨워 화 하기