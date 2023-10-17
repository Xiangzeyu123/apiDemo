import {
  timestampToDate,
  showToast,
  callFunction,
  myShowToast
} from '../../utils/tools/tools'
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showLk: false,
    supervisor: null,
    workeHours: null,
    companyName:null,
    contractNumber: null,
    contractSubject: null,
    Director: null,
    caseId: null,
    status:null,
    statusShow:false,
    columns:['既遂','進行']
  },
  //
  onClose(){
    this.setData({ statusShow: false });
  },
  showPopup(){
    this.setData({ statusShow: true });
  },
  onCancel(){
    this.setData({ statusShow: false });
  },
  onConfirm(value){
      this.setData({
          status:value.detail.index,
          statusShow:false
      })
  },

  /**
   * 更新 添加 参数校验
   */
  async paramsChecks(data){
      if(data.openid==""||data.openid==null){
          await myShowToast("ユーザーIDを取得できない、改めてログアウトしてください")
          return true
      }
      if(data.supervisor==""||data.supervisor==null){
          await myShowToast("監督員を入力してください")
          return true
      }
      if(data.contractNumber==''||data.contractNumber==null){
          await myShowToast("契約番号を入力してください")
          return true
      }
      if(data.contractSubject==''||data.contractSubject==null){
          await myShowToast("契約件名を入力してください")
          return true
      }
      if(data.Director==''||data.Director==null){
          await myShowToast("実施責任者を入力してください")
          return true
      }
      if(data.workeHours==''||data.workeHours==null){
          await myShowToast("作業時間を選択してください")
          return true
      }
      if(data.status!==0&&data.status!==1){
          await myShowToast("案件状態を選択してください")
          return true
      }
      if(data.companyName==""||data.companyName==null){
          await myShowToast("会社の名前を入力してください")
          return true
      }
      return false
  },
  /**
   * 添加或更新
   */
  async submitData() {
    let that = this
    let {
      openid,
      supervisor,
      contractNumber,
      contractSubject,
      Director,
      workeHours,
      status,
      companyName
    } = this.data
    var caseId = this.data.caseId;
    let params = {
      action: '',
      doc: {      
        _id: '',
      },
      data: {
        openid,
        supervisor,
        contractNumber,
        contractSubject,
        Director,
        workeHours,
        companyName,
        status
      }
    }
    let checkRes = await this.paramsChecks(params.data)
    if(checkRes){
        return
    }else{
    if (caseId != "" && caseId != null) {
      params.doc._id = caseId
      params.action = 'update'
      await callFunction('caseProject', params).then((res) => {
        console.log(res)
        that.getCase(caseId)
      })
      showToast("修正完了しました", "success", 1000)
      wx.reLaunch({
        url: '/pages/Allattendance/Allattendance',
      })
      return;
    }else{
    params.action = 'add'
    await callFunction('caseProject', params).then((res) => {
      console.log(res)
      this.setData({
        caseId: res.result._id
      })
      that.getCase(res.result._id)
    })
    showToast("追加完了しました", "success", 1000)
    wx.reLaunch({
        url: '/pages/Allattendance/Allattendance',
      })
    }
  }
},
  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    this.setData({
      openid: app.globalData.userInfo.openid
    })
    let time = new Date()
    //案件id
    var caseId = null
    try {
      caseId = options.id
    } catch (error) {
      showToast("没有获取案件id", 'error', 2000)
      return;
    }
    var workeHours = timestampToDate(time.getTime())
    this.setData({
      workeHours: workeHours.year + "-" + workeHours.month,
      currentDate: time,
      caseId: caseId
    })
    console.log(this.data.workeHours)
    if (caseId == null) {
      return
    }
    await this.getCase(caseId)
  },
  async getCase(caseId) {
    let params = {
      action: 'selectOne',
      _id: caseId
    }
    await callFunction('caseProject', params).then((res) => {
      var data = res.result.data
      console.log(data)
      this.setData({
        supervisor: data.supervisor,
        contractNumber: data.contractNumber,
        contractSubject: data.contractSubject,
        companyName:data.companyName,
        Director: data.Director,
        workeHours: data.workeHours,
        status:data.status
      })
    })
  },
  onCloseLk() {
    this.setData({
      showLk: false
    })
  },
  showLk() {
    this.setData({
      showLk: true
    })
  },
  dateChangelk(even) {
    console.log(even.detail.dateString)
    this.setData({
      workeHours: even.detail.year + "-" + even.detail.month
    })
  },
  determine(e) {
    var date = timestampToDate(e.detail)
    this.setData({
      workeHours: date.year + "-" + date.month,
      showLk: false
    })
  },
  cancellation() {
    this.setData({
      showLk: false
    })
  },
  onClickLeft() {
    wx.navigateBack({
      delta: 1 //返回页数
    })
  },
  onExit() {
    wx.navigateBack({
      delta: 1 //返回页数
    })
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
    this.setData({
      currentDate: new Date().getTime(),
      minDate: new Date(2019, 10, 1).getTime(),
    })
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