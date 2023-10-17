const getWorkTime =(startTime,endTime)=>{
    //分割时间
    let startTimeArr = startTime.split(":")
    let endTimeArr = endTime.split(":")
    let minuteSum = (Number(endTime[0])-Number(startTime[0]))*60+(Number(endTime[1])-Number(startTime[1]))
    let hour = minuteSum/60
    let minute = minuteSum%60
    return date={
        hour:hour,
        minute:minute
    }
}
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

module.exports = {
  formatTime
}

