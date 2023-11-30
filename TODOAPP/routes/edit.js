const router = require('express').Router()

// edit 수정페이지 접속시
router.get('/:id', async (요청,응답) => {
  try {

    
    let result = await db.collection('post').findOne({ _id : new ObjectId(요청.params.id) })
    응답.render('edit.ejs',{result : result})
  } catch {
    응답.status(500).send('서버에러')
  }
})

// edit 글 수정 API
router.put('/' , async (요청,응답) => {
    
  let data = { title : 요청.body.title , content : 요청.body.content}
  // db.collection('post').updateOne({},{$set : {}}) // 수정하는법 updateOne({바꿀 데이터 ex) id : xx} ,{ $set : { title : 이걸로 }}) 아이디가 이거인것의 title을 이걸로 덮어씀
  await db.collection('post').updateOne({ _id : new ObjectId(요청.body.id) },{$set : data })
  // await db.collection('post').updateOne({_id : x} , {$inc : { like : 1}}) $set은 덮어쓰기 , inc는 뒤에 숫자를 연산해주는 기능 , $mul 곱하기 등등 여러가지있음
  // updateOne은 한개의 도큐먼트만 수정  동시에 여러개 수정하고 싶다면 updateMany 예를들면 좋아요가 10개이상 같은 조건
  // await db.collection('post').updateMany({ like : { $gt : 10} },{$inc : { like : 1}  }) // $gt는 값보다 큰 > 10   등등 여러가지 필터있음

  // 하지만 user에게서 받아오는 id값은 html에 있으면 임의 조작이 가능한데 이럴경우는 어떻게?
  응답.redirect('/list')
})


module.exports = router