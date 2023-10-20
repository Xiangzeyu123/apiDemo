// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const params = event
  console.log(params)
  switch (params.action) {
    case 'add': {
      return add(params)
    }
    case 'selectOne': {
      return selectOne(params)
    }
    case '　updata':{
      return 　updata(params)
    }
    case 'selectAll':{
      return selectAll(params)
    }
    default: {
      return
    }
  }
  async function add(params){
    var data = params.data
    data['creat_time'] = new Date()
    return  db.collection('gbhCase').add({
      data:data
    })
  }
  async function selectOne(params){
    var res = await db.collection('gbhCase').doc(params._id).get()
    return res
  }
  async function updata(params){
    var data = params.data
    return db.collection('gbhCase').doc(params.doc._id).update({
      data:data
    })
  }
  function strNumberUtil(data){
    var arry = null
    var date = null
    if(typeof(data) == 'string'){
      arry = data.split("-")
      date =Number(arry[0]+'.'+arry[1])
      return date
    }else{
      arry = String(data).split(".")
      date =arry[0]+'-'+arry[1]
      return date
    }
  }
  async function selectAll(params){
    var where = params.where
    if(where.beginTime == null){
      delete where.beginTime
    }
    if(where.endTime == null){
      delete where.endTime
    }
    if(where._id != null){
      where._id = _.in(where._id)
    }else{
      delete where._id
    }
    return  db.collection('gbhCase').where(where).get()  
  }
}