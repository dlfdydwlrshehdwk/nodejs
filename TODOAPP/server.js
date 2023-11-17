// 이 두줄은 익스프레스 라이브러리를 사용하겠다 라는소리
const express = require('express')
const app = express()
const methodOverride = require('method-override') // 메소드 오버라이드 쓰겠다는소리

// passport 라이브러리 셋팅 s//
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')

app.use(passport.initialize())
app.use(session({
  secret: '암호화에 쓸 비번',
  resave : false, // 유저가 서버로 요청할때마다 세션 갱신할건지 default : false
  saveUninitialized : false // 로그인 안해도 세션 만들것인지 default : false
}))
app.use(passport.session()) 
// passport 라이브러리 셋팅 e// 

app.use(methodOverride('_method')) // 메소드 오버라이드 쓰겠다는 소리
app.use(express.static(__dirname + '/public')) // 폴더를 server.js에 등록해야 폴더안의 파일들 html에서 사용가능 .css .js .jpg 이런파일을 static파일이라고함
app.set('view engine','ejs') // ejs 사용할거임

// 요청.body - 유저가 form태그로 보낸 데이터인데 이거 꺼내오는게 상당히 귀찮은데 이걸 쉽게해주는 코드2줄 ( 이걸 셋팅해놔야 요청.body 사용가능 )
app.use(express.json())
app.use(express.urlencoded({extended:true})) 

// 몽고디비 라이브러리 셋팅
const { MongoClient, ObjectId } = require('mongodb')

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

  app.get('/list', async (요청,응답) => { // /list 접속시

    /* 
      생각해봅시다... list로 들어왔어... 리스트를 보여줘야하는데 여기서 조건을 생각.
      1. 최신순 2. 몇개 보여줄건지? 
      + 추가기능 페이지내이션 있어야겠지.
      + 정렬기능 있어야겠지 (최신순, 좋아요가 많은순, 댓글이 많은순이라던지, )
    */

    // 위의 코드는 db의 모든데이터를 가져오는 코드라 가독성이 안좋을 수 있음 그래서 개수제한을 둬서 짜르기로 ㄱㄱ
    // limit과 skip은 변수화 해놓으면 유용할듯
    // let result = await db.collection('post').find().limit(5).toArray()
    let result = await db.collection('post').find().toArray()
    // let result = await db.collection('post').find().toArray()
    // result = await db.collection('post').find().skip(5).limit(5).toArray() // 앞에 5개는 제외하고 5개를뽑아오는 코드 - pagenation 할때 유용할듯함. .skip() 은 성능이 안좋다 너무 많은 갯수는 ㄴㄴ
    // url파라미터값을 받아오면 검색페이지 같은거 할때 유용할듯함
    // 예를들어 검색/숫자 같이 검색페이지 뒤에 숫자가 따라오는식이라면...
    /* app.get('/list/:id', async (요청, 응답) => {
      let result = await db.collection('post').find()
        .skip( (요청.params.id - 1) * 5 ).limit(5).toArray() 
      응답.render('list.ejs', { 글목록 : result })
    })  */
    
    // 스킵을 안쓰고 방금게시물에서 다음페이지 바로가기 같은 기능은...
    /* app.get('/list/:id', async (요청,응답) => {
      let result = await db.collection('post').find({_id : {$gt : new ObjectId(요청.params.id)}}).limit(5).toArray()
      응답.render('검색페이지.ejs',{ result : result})
    }) */
    // 이렇게 가능할듯하다. $gt는 _id가 방금본마지막게시물보다 큰거를 다 찾아옴  <- 여기서 5개제한을 걸어가져오는것 
    // - 왜? - skip은 성능이 안좋으니까 다른방법으로 이게있단거(장점 :  빠름 - 아이디로 찾는게 되게빠르다고함, 단점 : 페이지이동은 불가능 - 이전, 다음 이런 화살표기능만 가능) 

    // pagenation 한다면 pagenation에 숫자를 읽어오거나 배열의 순번을 이용해서 변수에 담아 사용가능할듯.
    // 또는 글을 만들 때 id값을 정수로 부여하면 몇번째로 가거나 하는거 쉽게 구현가능 - 하지만 이 기능을 원하는 사람 흔치않음 - 필요한지는 스스로 고민해볼것
    // 정수로 글번호를 부여하고 싶다면 auto increment를 해야함.
    /* 일단 counter 라는 다른 이름의 컬렉션을 하나 만들고 
    그 안에 { _id : 자동부여된거, count : 0  } 이런 document를 하나 발행해둡니다. 
    그 다음에 게시물을 하나 발행할 때 마다 어떻게 하냐면 
    1. counter 컬렉션에 있던 document 를 찾아와서 count : 에 기재된 값을 출력해봅니다. 
    2. 그 값에 +1을 한 다음 그걸 _id란에 기입해서 새로운 글을 발행합니다. 그럼 { _id : 1, title : 어쩌구 } 이런게 발행되겠군요.
    3. 성공적으로 발행된걸 확인하면 counter 컬렉션의 document에 있던 count : 항목을 +1 해줍니다. updateOne 쓰면 되겠군요. */ 
    // 하지만 트리거 기능을 쓰는게 더정확하다고하며  https://www.mongodb.com/basics/mongodb-auto-increment - 영문이라 해석필요 모름 ..ㅠ
    // 트리거는 db에 뭔가 변화가 일어날때 자동으로 실행되는 코드를 뜻한다고 함.
    // 정렬기능은 objectid순으로 정렬가능하며 , 날짜는 날짜기록해서 날짜순정렬가능
    
    응답.render('list.ejs' , {글목록 : result, 글수 : result.length})
  })

  app.get('/list/:id', async (요청,응답) => {
    try {
      let nowPage = 요청.params.id;
      let skip = (요청.params.id - 1) * 5 ;
      let limit = 5;
      let result = await db.collection('post').find().skip(skip).limit(limit).toArray();
      let data = await db.collection('post').find().toArray()
      응답.render('list.ejs' , {글목록 : result , params : 요청.params.id, 글수 : data.length, 현재페이지 : nowPage})
    } catch {
      응답.status(500).send('오류')
    }
  })
  

  // write 글쓰기 페이지 접속시 
  app.get('/write',(요청,응답) => {
    응답.render('write.ejs')
  })
  // add 글 추가하는 API
  app.post('/add', async (요청,응답) => {
    // console.log(요청.body) // 유저가 보낸 데이터
    // 간혹 서버에 문제가 생길 수 있으니 try catch문으로 처리 try - 잘되면 , catch - 안됐을때
    try {
      // 예외처리 - 빈칸으로 전송한다던가 할때 ( 여러상황을 예외처리하는게 좋음 , js로 예외처리를 할 수 있으나 코드는 조작이 가능하니 최종은 서버에서 한다. )
      if ( 요청.body.title == '' ) {
        응답.send('제목을 입력하세요')
      } else {
        let data = {title : 요청.body.title, content : 요청.body.content}
        await db.collection('post').insertOne(data)
        응답.redirect('/list') // 다른페이지로 이동시켜줌
      }
    } catch(e) {
      // console.log(e) // 에러의 이유
      응답.status(500).send('서버에러')
    }
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
    if (result.password == 입력한비번) { // 아이디있으면 비번이랑 비교
      return cb(null, result)
    } else { // 일치 하지 않으면
      return cb(null, false, { message: '비번불일치' });
    }
  }))

  // /login 접속시 로그인 페이지 보여주기
  app.get('/login', async (요청,응답) => {
    응답.render('login.ejs')
  })
  }).catch((err)=>{
    // 디비연결에 실패하였을때
    console.log(err)
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

// 2. 정렬기능
// 3. 검색 - 검색페이지를 하나 만들어서