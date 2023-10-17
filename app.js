App({
  async onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        traceUser: true,
        env:'gbh-4gqt7w1a11eccda8'
      });
    }
    // await this.getOpenid().then((res)=>{
    //   if(res.data.length == 0){
    //     return
    //   }
    //   this.globalData.userInfo = res.data[0]
    // })
  },


  // getOpenid() {
  //   return new Promise((resolve, reject) => {
  //     wx.cloud.callFunction({
  //       name: 'getOpenid',
  //       complete: res => {
  //         wx.cloud.database().collection('users').where({_openid:res.result.openid }).get({
  //           success:res=>{
  //             resolve(res)
  //           }
  //         })
  //       }
  //     })
  //   })
  // },
  getUser() {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'getOpenid',
        complete: res => {
          resolve(res.result.openid);
        }
      })
    })
  },
  globalData: {
    userInfo: {
      hone:null,
      id: 0,
      nickname: null,
      name: null,
      _id: null,
      openid:null
    },
    footerNavList: [
      {
        icon: 'home-o',
        text: 'トップページ',
        url: '/pages/home/home'
      },
      {
        icon: 'orders-o',
        text: '勤務表',
        url: '/pages/JumpToPage/JumpToPage'
      },
      {
        icon: 'friends-o',
        text: '個人',
        url: '/pages/index/index'
      }
    ],
    footerNavListAdmin:[
      {
        icon: 'home-o',
        text: '社员管理',
        url: '/pages/userIndex/userIndex'
      },
      {
        icon: 'orders-o',
        text: '案件管理',
        url: '/pages/Allattendance/Allattendance'
      },
      {
        icon: 'down',
        text: '勤務報告',
        url: '/pages/excelimport/excelimport'
      }
    ]
  }
})