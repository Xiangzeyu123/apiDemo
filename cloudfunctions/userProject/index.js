// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: "gbh-4gqt7w1a11eccda8" }) // 使用当前云环境
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
      return selectAll()
    }
    case 'delete':{
        return deleteUser(params)
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
  async function deleteUser(params){
      var ids = params.data
      return db.collection('users').where({
          _id:_.in(ids)
      }).remove()
  }
  async function add(params){
    var data = params.data
    return db.collection('users').add({
      data:{
          username:data.username,
          nickName:data.nickName,
          password:data.password,
          identity:data.identity,
          name:data.name,
          create_time:new Date()
      }
  })
  }
  async function selectAll(params){
    return  db.collection('users').get()
  }
  async function selectOne(params){
    let where =params.where
    if(params.hasOwnProperty('or')&&params.or==true){
        where = _.or([{username:where.username},{nickName:where.nickName}])
    }
    console.log(where)
    return  db.collection('users').where(where
    ).get()
  }
}