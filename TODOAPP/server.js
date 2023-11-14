// 이 두줄은 익스프레스 라이브러리를 사용하겠다 라는소리
const express = require('express')
const app = express()
const methodOverride = require('method-override')

app.use(methodOverride('_method'))
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

  app.get('/list', async (요청,응답) => { // /news 접속시
    // db.collection('post').insertOne({title : '타이틀'})
    let result = await db.collection('post').find().toArray() // db에서 모든데이터 가져오는 코드 awiat이 필수라 위에 함수에 async또한 필수
    // db.collection('post').find().toArray().then(()=>{}) // awiat 쓰기 싫다면 then으로 활용가능
    console.log(result)
    응답.render('list.ejs' , {글목록 : result})
  })

  app.get('/write',(요청,응답) => {
    응답.render('write.ejs')
  })
  
  app.post('/add', async (요청,응답) => {
    console.log(요청.body) // 유저가 보낸 데이터
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

  app.get('/edit/:id', async (요청,응답) => {
    try {

      
      let result = await db.collection('post').findOne({ _id : new ObjectId(요청.params.id) })
      응답.render('edit.ejs',{result : result})
    } catch {
      응답.status(500).send('서버에러')
    }
  })
  
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

  // form태그에서 put이나 delete사용간으
  // npm install method-override - 인스톨코드
  // 셋팅코드
  // const methodOverride = require('method-override')
  // app.use(methodOverride('_method'))
  // 사용시 action ="/edit?_method=PUT" method="POST"  /요청URL 뒤에 ?_method=PUT
}).catch((err)=>{
  // 디비연결에 실패하였을때
  console.log(err)
})

