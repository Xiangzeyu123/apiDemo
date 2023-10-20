// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: "gbh-4gftzpcv39655cc0" }) // 使用当前云环境
const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  const params = event
  console.log(params)
  const wxContext = cloud.getWXContext()
  switch (params.action) {
    case 'add': {
      return add(params)
    }
    case 'selectOne': {
      return selectOne(params)
    }
    case 'update':{
      return update(params)
    }
    case 'selectAll':{
      return selectAll(params)
    }
    case 'getPage':{
      return getPage(params)
    }
    default: {
      return
    }
  }
  async function update(params){
    var data = params.data
    var where = params.where
    return db.collection('users').where(
      where
    ).update({data:data})
    
  }
  async function add(params){
    var data = params.data
    return db.collection('users').add({
      data:{
          nickName:data.nickName,
          password:data.password,
          identity:data.identity,
          create_time:new Date()
      }
  })
  }
  async function getPage(params){
    var data = params.data,
    where = params.where
    console.log(where)
    return  db.collection('users').where(where
    ).limit(data.LIMIT).skip(data.LIMIT*data.page).get()
  }
}