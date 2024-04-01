// multer 사용하겠다는 소리
const { S3Client } = require('@aws-sdk/client-s3')
const multer = require('multer')
const multerS3 = require('multer-s3')
const s3 = new S3Client({
  // 서울에서 사용하려면 'ap-northeast-2' aws사이트에 적혀있음
  region : 'ap-northeast-2',
  credentials : {
    // aws 액세스 비밀번호
    accessKeyId : process.env.S3_KEY,
    secretAccessKey : process.env.S3_SECRET
  }
})

const upload = multer({
  storage: multerS3({
    s3: s3,
    // 내 aws 닉네임
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

module.exports = upload;


// 갖다쓰려면 예시)
// const upload = require('./../upload')


// upload.single('img1')(요청,응답,(err)=>{
//   // 이미지업로드에 에러가 걸릴때.
//   // console.log(요청.file)
//   if(err) return 응답.send(err)
//   // 간혹 서버에 문제가 생길 수 있어 try catch문
//   try {
//     // 예외처리 - 빈칸으로 전송한다던가 할때 
//      ( 여러상황을 예외처리하는게 좋음 , js로 예외처리를 할 수 있으나 코드는 조작이 가능하니 최종은 서버에서 한다. )
//     if ( 요청.body.title == '' ) {
//       응답.send('제목을 입력하세요')
//     } else {
//       let data = {
//         title : 요청.body.title, 
//         content : 요청.body.content,
//         image : 요청.file.location ? 요청.file.location : null
//       }
//       database.insertOne(data)
//       응답.redirect('/list') // 다른페이지로 이동시켜줌
//     }
//   } catch(e) {
//     // console.log(e) // 에러의 이유
//     응답.status(500).send('서버에러' + e) 
//   } 
// })