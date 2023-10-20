// pages/userIndex/userIndex.js
import Toast from '@vant/weapp/toast/toast';
import {
  myhideLoading,
  myShowLoading,
  myShowToast,
  myShowToastSuccess,
  callFunction
} from '../../utils/tools/tools';
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasMore:true,//是否有下一页
    user: [],
    seacherVal: '',
    page: 0,
    LIMIT: 5,
    userFirst: {},
    changePd: false,
    ifPd: false,
    show: false,
    columns: ['用户', '管理员'],
  },
  excelimport(){
    wx.navigateTo({
      url: '../excelimport/excelimport',
    })
  },
  onClickLeft() {
    wx.reLaunch({
      url: '/pages/login/login',
    })
  },
  //取消添加
  addUserCancel(){
    this.setData({
        ifPd:false,
        changePd:false,
    })
    this.showUserInfo(1)
},
  //上一页
  upPage() {
    let {
      LIMIT,
      page,
      seacherVal
    } = this.data
    if (page - 1 < 0 || seacherVal !== '') {
      myShowToast("ページアップがありません")
      return
    }
    this.setData({
      page: --this.data.page
    })
    this.loadUserDate()
    if(!this.data.hasMore){
        this.setData({
            hasMore:true
        })
    }
  },
  //下一页
  async downPage() {
    let {
      LIMIT,
      user,
      seacherVal
    } = this.data
    if (user.length < LIMIT || seacherVal !== '') {
      myShowToast("次頁がありません")
      return
    }
    this.setData({
      page: ++this.data.page
    })
    await this.loadUserDate()
    //hasMore为fasle表示下一页没有数据 将page减一后返回
    if(!this.data.hasMore){
        this.setData({
            page:--this.data.page
        })
        myShowToast("次頁がありません")
        return
    }
  },
  onAddCancel(){
    this.setData({
        show: false
      });
  },
  //完成选择  
  async onConfirm(index) {
    //console.log(index.detail.index)
    await this.inputRole(this.data.columns[index.detail.index])
    this.onClose()
  },
  //获取焦点显示弹出层
  showPopup() {
    if (this.data.ifPd == true) {
      this.setData({
        show: true
      });
    }
  },
  //取消弹出层
  onClose() {
    this.setData({
      show: false
    });
  },
  //输入内容
  async inputId(event) {
    this.data.userFirst._id = event.detail
  },
  async inputnickName(event) {
    this.data.userFirst.nickName = event.detail
  },
  async inputRole(event) {
    //console.log(event)
    let identity = {
      identity: event
    }
    this.setData({
      userFirst: {
        ...this.data.userFirst,
        ...identity
      }
    })
  },
  async inputPw(event) {
    this.data.userFirst.password = event.detail
  },
  //添加用户 按钮
  async addUser() {
    myShowLoading()
    this.setData({
      ifPd: true,
      changePd: true,
      userFirst: {}
    })
    myhideLoading()
  },
  //取消添加 修改
  addcancel(){
    if(this.data.ifPd||this.data.changePd){
    this.setData({
        ifPd:false,
        changePd:false,
    })
    this.showUserInfo(1)
}
},
  //确认添加 修改 按钮
  async addConfirm() {
    myShowLoading()
    let { ifPd,changePd } = this.data
    var params = null
    let user = this.data.userFirst
    if (this.data.ifPd) {
      if (!this.addCheck(user)){
        return  
      } 
      user.identity = this.data.columns.indexOf(user.identity)
      params = {
        action: "add",
        data: {
          nickName: user.nickName,
          password: user.password,
          identity: user.identity
        }
      }
      await callFunction('userProject', params).then((res) => {
        console.log(res)
      })
      myhideLoading()
      this.loadUserDate()
      myShowToastSuccess('追加完了しました')
    } else {
      //修改密码
      //校验密码
      //console.log(user)
      if (!user.hasOwnProperty("password") || user.password === '' || user.password === null) {
        myShowToast('パスワードを入力してください')
        return
      }
      params = {
        action: "update",
        data: {
          password: user.password
        },
        where:{
          _id:user._id,
        }
      }
      await callFunction('userProject', params).then((res) => {
        console.log(res)
      })
      myhideLoading()
      this.loadUserDate()
      myShowToastSuccess('変更完了しました')
    }
    this.setData({
      ifPd: false,
      changePd: false
    })
    this.showUserInfo(1)
  },
  //添加前的校验
  addCheck(user) {
    //console.log(user)
    if (!user.hasOwnProperty("password") || user.password == '') {
      myShowToast('パスワードを入力してください')
      return false
    }
    if (!user.hasOwnProperty("identity") || user.identity == '') {
      myShowToast('役割を選択してください')
      return false
    }
    if (!user.hasOwnProperty("nickName") || user.nickName == '') {
      myShowToast('ユーザー名を入力してください')
      return false
    }
    return true
  },
   //点击用户显示信息
   async checkShow(value){
    let {item} = value.currentTarget.dataset
    let {userFirst} = this.data
    userFirst  = {
        nickName:item.nickName,
        identity:this.data.columns[item.identity],
        _id:item._id
    }
    //console.log(item)
    this.setData({
        userFirst:userFirst
    })
},
  //加载列表中的用户
  async loadUserDate(seacherVal) {
    myShowLoading()
    await this.userSeacher(seacherVal)
    if(!this.data.hasMore){
        //如果hasMore为false则没有数据要更新直接返回
        myhideLoading()
        return
    }
    this.showUserInfo(1)
    myhideLoading()
  },
  //得到用户集合
  async userSeacher(username) {
    let {
      LIMIT,
      page
    } = this.data
    var params = {
      action: "getPage",
      data: {
        LIMIT: LIMIT,
        page: page
      },
      where:{},
    }
    if (username != undefined && username != '') {
      params.where = {
        nickName: username
      }
      params.data.page = 0
    }
    await callFunction('userProject', params).then((res) => {
      //console.log(res)
      if(res.result.data.length==0){
        this.setData({
            hasMore:false
        })
        return
      }
      this.setData({
        user: res.result.data,
      })
    })
  },
  //得到在下方显示用户信息
  async showUserInfo(id) {
    let user = this.data.user[id - 1]
    let userParam = {
        nickName:user.nickName,
        identity:this.data.columns[user.identity],
        password:'',
        _id:user._id
    }
    this.setData({
      userFirst: userParam
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadUserDate()
    this.setData({
      footerNavListAdmin: app.globalData.footerNavListAdmin,
    })
  },
  //取消搜索
  async onCancel(event) {
    this.setData({
      seacherVal: ''
    })
    this.loadUserDate()
  },
  //触发搜索
  async onSearch(event) {
    //console.log(event.detail)
    myShowLoading()
    this.setData({
      seacherVal: event.detail
    })
    this.loadUserDate(event.detail)
    myhideLoading()
  },
  //修改密码
  async changeUser(params) {
    myShowLoading()
    //console.log(params)
    let {
      item
    } = params.currentTarget.dataset
    //console.log(item)
    item.identity = this.data.columns[item.identity]
    item.password = ''
    this.setData({
      changePd: true,
      userFirst: item
    })
    myhideLoading()
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
    let footerNavComp = this.selectComponent('#footer-nav-bar-id');
    footerNavComp.init()
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