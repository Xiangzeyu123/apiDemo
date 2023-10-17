// pages/login/login.js
import {
  callFunction,
  showToast,
  myhideLoading,
  myShowLoading
} from '../../utils/tools/tools'
var app = getApp();
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    current: 0,
    codeText: '获取验证码',
    counting: false,
    nickName: '',
    password: '',
    code: '',
  },
  onClose() {
    this.setData({
      show: false
    });
  },

  // 登陆注册监听
  click(e) {
    let index = e.currentTarget.dataset.code;
    this.setData({
      current: index
    })
  },

  getHone(e) {
    this.setData({
      'user.nickName': e.detail.value
    })
  },
  getHone(e) {
    this.setData({
      'user.nickName': e.detail.value
    })
  },
  getPassword(e) {
    this.setData({
      'user.password': e.detail.value
    })
  },
  //倒计时60秒
  countDown(that, count) {
    if (count == 0) {
      that.setData({
        codeText: '获取验证码',
        counting: false
      })
      return;
    }
    that.setData({
      counting: true,
      codeText: count + '秒后重新获取',
    })
    setTimeout(function () {
      count--;
      that.countDown(that, count);
    }, 1000);
  },


  async login(e) {
    wx.setStorageSync('thisMonthCase', "")
    wx.setStorageSync('workData', "")
    /**
     * /^[0-9-]{10,13}$/i; 日本电话
     */
    var pnickNameReg = /^1[3456789]\d{9}$/
    // if(!pnickNameReg.test(this.data.user.name)){
    //   wx.showToast({
    //     title: "手机格式有误",
    //     icon: 'error',
    //     duration: 1000 //持续的时间
    //   })
    //   return;
    // }
    var identity = this.data.current,
    params = {
      nickName: this.data.nickName,
      password: this.data.password
    }
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
    // await this.getWxData().then()
    myShowLoading()
    console.log(params)
    const res = await callFunction('login', params).then()
    console.log(res)
    if (res.result.data.length == 0) {
      myhideLoading()
      showToast("用户账号或密码错误", 'error', 1000)
      return
    }
    console.log(res.result.data[0].identity+"" ,identity+"")
    if (res.result.data[0].identity+"" != identity+"") {
      myhideLoading()
      showToast("身份错误", 'error', 1000)
      return
    }
    app.globalData.userInfo.openid = res.result.data[0]._id
    app.globalData.userInfo['identity'] = identity+""
    myhideLoading()
    if(identity == 0){
      wx.reLaunch({
        url: '/pages/home/home',
      })
      return
    }
    wx.reLaunch({
      url:'/pages/userIndex/userIndex',
    })
  },
  getWxData(){
    return new Promise((resolve,reject)=>{
      wx.getUserProfile({
        desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success: (res) => {
          app.globalData.userInfo['avatarUrl'] = res.userInfo.avatarUrl
           console.log(res.userInfo)
           resolve(true)
        }
      })
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    // setTimeout(() => {
    //   this.setData({
    //     user: app.globalData.userInfo
    //   })
    // }, 800)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

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