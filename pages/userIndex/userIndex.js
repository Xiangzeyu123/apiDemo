// pages/userIndex/userIndex.js
import Toast from '@vant/weapp/toast/toast';
import {
  myhideLoading,
  myShowLoading,
  myShowToast,
  myShowToastSuccess,
  callFunction,
  formateDate
} from '../../utils/tools/tools';
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list_num:0,
    list:[],
    show_action:false,
    hasData:true,
    user: [],
    seacherVal: '',
    columns: ['社員', '管理職'],
  },
  /**
   * 返回页面
   */
  onClickLeft() {
    wx.reLaunch({
      url: '/pages/login/login',
    })
  },
  /**
   * 根据用户id显示详细的用户信息
   * @param {用户id} e 
   */
  getContent(e) {
   // console.log(e.currentTarget.dataset._id)
      wx.navigateTo({
        url: '/pages/userInfo/userInfo?id='+e.currentTarget.dataset._id,
      })
  },
  /**
   * 加载所有用户或搜索用户
   * @param {搜索的用户姓名} username 
   */
  async loadUserListOrSearchUser(username){
      var params = {
        action: "selectAll",
      }
      if (username !== undefined && username !== '') {
        params.where = {
          nickName: username
        }
        params.action="selectOne"
      }
      await callFunction('userProject', params).then((res) => {
        //console.log(res)
        if(res.result.data.length==0){
          this.setData({
            hasData:false
          })
          return
        }else{  
          res.result.data.forEach(v=>{
              v.create_time=v.create_time.slice(0,v.create_time.indexOf("T"))
          })   
          this.setData({
             user: res.result.data,
          })    
        }
      })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    await myShowLoading()
    this.loadUserListOrSearchUser()
    this.setData({
      footerNavListAdmin: app.globalData.footerNavListAdmin,
    })
    await myhideLoading()
  },
  /**
   * 添加用户
   */
  async useradd(){
    wx.navigateTo({
        url: '/pages/userInfo/userInfo',
      })
  },
  /**
   * 修改管理/取消的显示
   */
  showAction() {
    this.setData({
      show_action: !this.data.show_action
    })
  },
  /**
   * 删除按钮
   */
  async deleteUser(){
      let {list} = this.data
      let params = {
          action:"delete",
          data:list
      }
      let res = await callFunction("userProject",params)
      await myShowToast("削除完了しました")
      this.setData({
        show_action:!this.data.show_action
      })
      this.loadUserListOrSearchUser()
  },
  /**
   * 删除选项
   * @param {*} e 
   */
  actionChange(e) {
    //console.log('checkbox发生change事件，携带value值为：', e.detail.value)
    let  va = e.detail.value;
    console.log(va)
    this.setData({
      list:va,
      list_num:va.length
    })
  },
  /**
   * 取消搜索
   * @param {} event 
   */
  async onCancel(event) {
    await myShowLoading()
    this.loadUserListOrSearchUser()
    await myhideLoading()
  },
  /**
   * 搜索用户触发
   * @param {*} event event.detail为搜索内容
   */
  async onSearch(event) {
      await myShowLoading()
      this.loadUserListOrSearchUser(event.detail)
      await myhideLoading()
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    let footerNavComp = this.selectComponent('#footer-nav-bar-id');
    footerNavComp.init()
  },
})