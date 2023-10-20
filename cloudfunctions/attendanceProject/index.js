// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: "gbh-4gftzpcv39655cc0" }) // 使用当前云环境
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
    case 'update':{
      return update(params)
    }
    case 'selectAll':{
      return selectAll(params)
    }
    default: {
      return
    }
  }
  async function selectAll(params){
    var data = params.data,
    where = null
    console.log(data)
    if(data.today == null&& data.todMonth == null){
      where = undefined
    }else {
      where = _.gte(new Date(data.todMonth)).and(_.lte(new Date(data.today))) 
    }
    return db.collection('gbh_attendance').where({
      day:where,
      openid:data.openid
    }).get()  
  }
  async function add(params){
    var data = params.data
    data.day = new Date(data.day)
    data['create_time'] = new Date()
    return db.collection('gbh_attendance').add({
      data:data
    })
  }
  async function update(params){
    var data =params.data
    data.day = new Date(data.day)
    data['update_time'] = new Date()
    return db.collection('gbh_attendance').doc(params.doc._id).update({
        data:data
    })
  }
  function strNumberUtil(data){
    var arry = null
    var date = null
    console.log(typeof(data))
    if(typeof(data) == 'string'){
      arry = data.split("-")
      if(arry.length == 2){
        date =Number(arry[0]+'.'+arry[1])
      }else if(arry.length == 3){
        date =Number(arry[0]+'.'+arry[1]+arry[2])
        console.log(date)
      }
      return date
    }else{
      arry = String(data).split(".")
      date =arry[0]+'-'+arry[1]
      return date
    }
  }
}