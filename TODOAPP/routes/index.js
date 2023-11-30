const router = require('express').Router()

router.get('/', async (요청,응답) => {
  let result = 요청.user
  응답.render('index.ejs',{login : result})
} )

module.exports = router