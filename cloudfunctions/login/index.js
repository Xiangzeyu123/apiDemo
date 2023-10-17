// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: 'gbh-4gqt7w1a11eccda8' }) // 使用当前云环境
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let tasks = []
  let params = event
  console.log(params)
  return db.collection('users').where({
    nickName:params.nickName,
    password:params.password
  }).get()
}