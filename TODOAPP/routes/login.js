const router = require('express').Router()

router.get('/', async (요청,응답) => {
  let login = 요청.user;
  응답.render('login.ejs',{login : login})
})

module.exports = router