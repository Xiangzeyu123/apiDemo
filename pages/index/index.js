const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName') // 如需尝试获取用户信息可改为false
  },
  userUpdate(){
    wx.navigateTo({
      url: '../index/userUpdate/userUpdate',
    })
  },
  onLoad() {
    console.log(app.globalData.userInfo.avatarUrl)
    if (wx.getUserProfile) {
      console.log(app.globalData.footerNavList)
      this.setData({
        footerNavList: app.globalData.footerNavList,
        canIUseGetUserProfile: true
      })
    }
  },
  JumpCase(){
    wx.switchTab({
      url: '../Allattendance/Allattendance',
    })
  },
    /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    let footerNavComp = this.selectComponent('#footer-nav-bar-id');
    footerNavComp.init()
   },

  
})
