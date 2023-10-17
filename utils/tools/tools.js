/**
 * 格式化日期
 * @param {*} time 
 */
export const formateDate = (time) => {
  let year = time.getFullYear();
  let month = time.getMonth() + 1 < 10 ? '0' + (time.getMonth() + 1) : (time.getMonth() + 1);
  let day = time.getDate() < 10 ? '0' + time.getDate() : time.getDate();
  return year + '-' + month + '-' + day;
}
/**
 * 获取当前日期一周内的时间
 * @param {*} data 日期Date
 */
export const getCurrWeekList = (data) => {
  //根据日期获取本周周一~周日的年-月-日
  let weekList = [],
    date = new Date(data);
  //获取当前日期为周一的日期
  date.setDate(date.getDay() == "0" ? date.getDate() - 6 : date.getDate() - date.getDay() + 1);
  // push周一数据
  weekList.push(formateDate(date));
  console.log(weekList)
  //push周二以后日期
  for (var i = 0; i < 6; i++) {
    date.setDate(date.getDate() + 1);
    weekList.push(formateDate(date));
  }
  return weekList;
}
//["2022-08-08", "2022-08-09", "2022-08-10", "2022-08-11", "2022-08-12", "2022-08-13", "2022-08-14"]

/**
 * 时间戳转化为年月日
 * @param {*} timestamp 
 */
export const timestampToDate =(timestamp)=>{
  var date = new Date(timestamp);
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  
  return {
      year: year,
      month: month,
      day: day
  };
}
export function callFunction(name, data) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: name,
      data: data,
      success: function (res) {
        resolve(res);
      },
      fail: function (err) {
        reject(err);
      }
    });
  })
}
export function showToast(title, status,time) {
     wx.showToast({
        title: title,
        icon:"none",//success、loading、none、error
        duration: time //持续的时间
      })
}

//显示加载框
export const myShowLoading=()=>{
  return new Promise((resolve)=>{
      wx.showLoading({
        title: 'Loading......',
        success:resolve
      })
  })
}
//隐藏加载框
export const myhideLoading=()=>{
  return new Promise((resolve)=>{
      wx.hideLoading({
          success:resolve
      })
  })
}
//消息提示框
export const myShowToast=(title)=>{
  return new Promise((resolve)=>{
      wx.showToast({
        title,
        icon:"none",
        success:resolve
      })
  })
}

//消息提示框--成功
export const myShowToastSuccess=(title)=>{
  return new Promise((resolve)=>{
      wx.showToast({
        title,
        success:resolve
      })
  })
}
//获取当月相关时间
export const firstDate=function(date){
    var now = new Date(date)
    var mindate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 1);//最早时间
    var maxdate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);//最晚时间
    var paramsDate = new Date(now.getFullYear(), now.getMonth(), 10);//云函数使用的时间
    let maxday = new Date(now.getFullYear(), Number(now.getMonth() + 1), 0).getDate()//当月最大天数
     let dateInfo={
        mindate:mindate,
        maxdate:maxdate,
        paramsDate:paramsDate,
        maxday:maxday
    }
    return dateInfo
}
export const getWorkTime =(startTime,endTime)=>{
    //分割时间
    let startTimeArr = startTime.split(":")
    let endTimeArr = endTime.split(":")
    let minuteSum = (Number(endTimeArr[0])-Number(startTimeArr[0]))*60+(Number(endTimeArr[1])-Number(startTimeArr[1]))
    let hour =parseInt(minuteSum/60)
    let minute = minuteSum%60
    let date={
        hour:hour,
        minute:minute
    }
    return date
}