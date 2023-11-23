const { MongoClient } = require("mongodb")

const url = process.env.DB_URL
let connectDB = new MongoClient(url).connect()

module.exports = connectDB

// let db까지 변수전체를 다 담아서 익스포트 하지 않는 이유
// 디비변수는 변수가 완성되기까지 시간이 걸린다.
// 늦게처리가 될수있어서 익스포트해서쓰면 잘안된다고함..