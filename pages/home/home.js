import {
  timestampToDate,
  callFunction,
  myhideLoading,
  myShowLoading
} from '../../utils/tools/tools'
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: false,
    thisMonthCase: [],
    workData: [{
        title: "本月の労働日数",
        totalDay: 0 + "日"
      },
      {
        title: "本月の休暇日数",
        totalDay: 0 + "日"
      },
      {
        title: "本月の在宅勤務日数",
        totalDay: 0 + "日"
      },
      {
        title: "本月の出社日数",
        totalDay: 0 + "日"
      },
    ]
  },

  onClickLeft() {
    wx.reLaunch({
      url: '/pages/login/login',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    var thisMonthCase = wx.getStorageSync('thisMonthCase'),
      workData = wx.getStorageSync('workData')
    let time = new Date()
    var date = timestampToDate(time.getTime())
    console.log(date)
    this.setData({
      footerNavList: app.globalData.footerNavList,
      date: date.year + "年" + date.month + "月",
      currentDate: time
    })
    console.log(thisMonthCase, workData)
    if (workData == "" || thisMonthCase == "") {
      myShowLoading()
      await this.getCase(date)
      await this.getMywork(date)
      myhideLoading()
    } else {
      this.setData({
        thisMonthCase: thisMonthCase,
        workData: workData
      })
    }
  },


  async getCase(date) {
    console.log(date)
    let params = {
      action: 'selectAll',
      data: {
        todMonth: date.year + "-" + date.month + "-01",
        today: date.year + "-" + date.month + "-" + date.day + " 23:59:59",
        openid: app.globalData.userInfo.openid
      }
    }
    const res = await callFunction('attendanceProject', params).then()
    console.log(res)
    var thisMonthCase = res.result.data
    var newList4 = []
    thisMonthCase.forEach((res)=>{
      newList4.push(res.caseData.caseName)
    })
    thisMonthCase = Array.from(new Set(newList4))
    
    console.log('newList', thisMonthCase);
    wx.setStorageSync('thisMonthCase', res.result.data)
    this.setData({
      thisMonthCase: thisMonthCase
    })
  },

  async getMywork(date) {
    let params = {
        action: 'selectAll',
        data: {
          today: date.year + "-" + date.month + "-" + date.day + " 23:59:59",
          todMonth: date.year + "-" + date.month + "-" + "01",
          openid: app.globalData.userInfo.openid
        }
      },
      a = 0,
      b = 0,
      c = 0,
      d = 0
    const res = await callFunction('attendanceProject', params).then()
    res.result.data.forEach((item) => {
      console.log(item.status)
      a++
      if (item.status == 0) b++
      if (item.status == 1) c++
      if (item.status == 2) d++
    });
    //['在宅', '出社', '休暇']
    console.log(a, b, c, d)
    var workData = this.data.workData
    console.log(workData)
    workData[0].totalDay = a + "日"
    workData[1].totalDay = d + "日"
    workData[2].totalDay = b + "日"
    workData[3].totalDay = c + "日"
    wx.setStorageSync('workData', workData)
    this.setData({
      workData: workData
    })
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },
  showPopup() {
    this.setData({
      show: true
    });
  },
  onClose() {
    this.setData({
      show: false
    });
  },
  determine(e) {
    var date = timestampToDate(e.detail)
    this.setData({
      date: date.year + "年" + date.month + "月",
      show: false
    })
  },
  cancellation() {
    this.setData({
      show: false
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  async onShow() {
    let footerNavComp = this.selectComponent('#footer-nav-bar-id');
    footerNavComp.init()
    this.setData({
      currentDate: new Date().getTime(),
      minDate: new Date(2019, 10, 1).getTime(),
    })
    var time = new Date()
    var date = timestampToDate(time.getTime())
    await this.getCase(date)
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})