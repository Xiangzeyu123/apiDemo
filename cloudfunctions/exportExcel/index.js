// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: 'gbh-4gqt7w1a11eccda8' }) // 使用当前云环境
var xlsx = require('node-xlsx');
// 云函数入口函数
exports.main = async(event, context) => {
 /*  try { */
    let {params} = event
    console.log(params)
    //1,定义excel表格名
    let datenow = Date.now()
    let dataCVS = 'test'+datenow+'.xlsx'
    // //2，定义存储数据的
    let alldata = [];
    let supervisorRow = ['監督員：','',params.gbhCase[0].supervisor,'','','御中'];
    console.log(params.gbhCase[0].supervisor)
    let workingHoursRow = ['作業時間内訳：','',params.gbhCase[0].workingHours];
    console.log(workingHoursRow)
    let contractNumberRow = ['契約番号：','',params.gbhCase[0].contractNumber];
    let companyNameRow = ['会社名：','',params.gbhCase[0].companyName];
    let contractSubjectRow = ['契約件名：','',params.gbhCase[0].contractSubject];
    let DirectorRow = ['実施責任者：','',params.gbhCase[0].Director];
    alldata.push(supervisorRow)
    alldata.push(workingHoursRow)
    alldata.push(contractNumberRow)
    alldata.push(companyNameRow)
    alldata.push(contractSubjectRow)
    alldata.push(DirectorRow)
    alldata.push(null)
    let row = ['技術者名', null, ]; //表属性
    for(var i = 1;i<32;i++){
      row.push(i)
    }
    row.push('合計')
    alldata.push(row);
    
    var Number = params.gbhAttendance.length
    // var attendance ={
    //   name:"",
    //   dayList:{
    //     hourList:[8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8],
    //     minuteList:[]
    //   },
    //   total:{
    //     hourToatl:0,
    //     minuteTotal:0,
    //   }
    // }
    var rangeList =[]
    var sr = 8
    var er = 9 
    var count = 0
    var sumMinuteTotal = 0
    var sumhourhourToatl = 0
    var attendance = params.gbhAttendance
    for(var i = 1;i<Number*2;i++ ){
      if(i%2!=0){
        let arr = []
        if(sr>er){
          er=sr+1
        }
        var range = {s: {c: 0, r: sr}, e: {c: 0, r: er}};
        sr=er+1
        rangeList.push(range)
        arr.push(attendance[count].name)
        arr.push("時間")
        attendance[count].dayList.hourList.forEach((item,index)=>{
          arr.push(item)
        })
        sumhourhourToatl+=attendance[count].total.hourTotal
        console.log(attendance[count].total.hourTotal)
        arr.push(attendance[count].total.hourTotal)
        alldata.push(arr)
        arr = []
        arr.push(null)
        arr.push("分")
        attendance[count].dayList.minuteList.forEach((item,index)=>{
            arr.push(item)
        })
        sumMinuteTotal+=attendance[count].total.minuteTotal
        console.log(attendance[count].total.minuteTotal)
        arr.push(attendance[count].total.minuteTotal)
        alldata.push(arr)
        count++
      }
    }
    var endRow = []
    for(var i = 1;i<32;i++){
      endRow.push(null)
    }
    endRow.push('合計')
    endRow.push('時間')
    endRow.push(sumhourhourToatl)
    alldata.push(endRow)
    endRow = []
    for(var i = 1;i<32;i++){
      endRow.push(null)
    }
    endRow.push(null)
    endRow.push('分')
    endRow.push(sumMinuteTotal)
    alldata.push(endRow)
    rangeList.push({s: {c: 31, r: Number*2+7+1}, e: {c: 31, r: Number*2+7+2}})

    const sheetOptions = {'!merges': rangeList,'!cols': [{wch: 15}]}
    var buffer = xlsx.build([{name: 'mySheetName', data: alldata}], {sheetOptions});
    //4，把excel文件保存到云存储里
    return await cloud.uploadFile({
      cloudPath: dataCVS,
      fileContent: buffer, //excel二进制文件
    })

 /*  } catch (e) {
    console.error(e)
    return e
  } */
}