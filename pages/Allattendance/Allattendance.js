import util from '../../utils/dateTools';
import { callFunction,myhideLoading,myShowLoading,myShowToast } from '../../utils/tools/tools';
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // picker的上箭头下箭头
    select_list: [{
        name: '時間選択'
      },
      {
        name: '本月'
      },
      {
        name: '30天以内'
      },
      {
        name: '期日を指定する'
      },
    ],
    hasData: true,
    identity:'1',
    choseType: undefined, //选中的弹框类型
    sel_list: {
      start_time: '',
      end_time: '',
    },
    show_action:false,
    show_chose: false, //是否展示筛选项
    total: 0,
    list_num:0,
    list:[]
  },

  setCaseIng(){

  },  
  getContent(e) {
    //console.log(e.currentTarget.dataset._id)
    if(this.data.identity == 1){
      wx.navigateTo({
        url: '/pages/caseCommon/caseCommon?id='+e.currentTarget.dataset._id,
      })
    }
  },
  change (e) {
    let param = e.currentTarget.dataset.type,
      data = e.currentTarget.dataset.value,
      index = e.detail.value,
      dataArr = this.data[param],
      checked = e.currentTarget.dataset.checked;
    this.setData({
      [checked]: !this.data[checked]
    })
    if (dataArr[index] !== undefined) {
      this.setData({
        [data]: dataArr[index].name
      })
    }
  },
  showAction() {
    this.setData({
      show_action: !this.data.show_action
    })
  },

  actionChange(e) {
    //console.log('checkbox发生change事件，携带value值为：', e.detail.value)
    let  va = e.detail.value;
    //console.log(va)
    this.setData({
      list:va,
      list_num:va.length
    })
  },


  async onLoad(options) {
      await myShowLoading()
    const openid = app.globalData.userInfo._id
   // console.log(openid)
    this.setData({
      footerNavListAdmin: app.globalData.footerNavListAdmin,
      openid:openid,
      identity:app.globalData.userInfo.identity
    })
    await this.getData(openid)
    await myhideLoading()
  },
  async onShow () {
    let date = this.getRangDate()
    this.setData({
      show_chose: false,
      'sel_list.start_time': date.startDate,
      'sel_list.end_time': date.endDate,
      identity:app.globalData.userInfo.identity
    })
    if(this.data.identity==1){
        let footerNavComp = this.selectComponent('#footer-nav-bar-id');
        console.log(footerNavComp)
        footerNavComp.init()
    }
    this.hegad()
    // this.getData(this.data.openid)
  },

  async getData(openid){
    var that = this,
     params = {
      action:'selectAll',
    },
    caseList = []
   // console.log(this.data.identity)
    if(this.data.identity == 1){
      params['where'] = {
        openId:null,
        beginTime:null,
        endTime:null,
        _id:null
      }
      await callFunction('caseProject',params).then((res)=>{
       // console.log(res)
        that.setData({
          caseList:res.result.data
        })
    })
    }else  if(this.data.identity == 0){
      params['data'] = {
        todMonth: null,
        today:null,
        openid:app.globalData.userInfo.openid
      }
    //  const res = await callFunction('attendanceProject',params).then()
    //  console.log(res.result.data)
    //  res.result.data.forEach(item => {
    //    _idList.push(item.caseData.caseId)
    //  });
     params.action = 'selectCaseAll'
     params['where'] = {
      openId:app.globalData.userInfo.openid
    }
    const res = await callFunction('attendanceProject',params).then()
    res.result.list.forEach(item=>{
      caseList.push(item.data[0])
    })
    //console.log(caseList)
    that.setData({
      caseList:caseList
    })
    }
  },
  /**
   * 删除案件
   */
  async deleteCase(){
      let {list} = this.data
      let params={
          action:"delete",
          data:list
      }
      await callFunction("caseProject",params)
      await myShowToast("削除完了しました")
      this.setData({
        show_action:!this.data.show_action
      })
      await this.getData()
  },

  onReady() {
    this.hegad()
  },
  hegad(){
    var query = wx.createSelectorQuery();
    query.select('#fix_box').boundingClientRect()
    //console.log(1)
    query.exec((res) => {
      var height = res[0].height; // 获取高度
      //console.log(height)
      this.setData({
        fix_top: height
      })
    })
  },

  /**
    * 获取本月开始和结束日期
    * @returns {{endDate: string, startDate: string}}
    */
  getRangDate() {
    var firstDate = new Date();
    var startDate = firstDate.getFullYear() + "-" + ((firstDate.getMonth() + 1) < 10 ? "0" : "") + (firstDate.getMonth() + 1) + "-" + "01";
    var date = new Date();
    var currentMonth = date.getMonth();
    var nextMonth = ++currentMonth;
    var nextMonthFirstDay = new Date(date.getFullYear(), nextMonth, 1);
    var oneDay = 1000 * 60 * 60 * 24;
    var lastDate = new Date(nextMonthFirstDay - oneDay);
    var endDate = lastDate.getFullYear() + "-" + ((lastDate.getMonth() + 1) < 10 ? "0" : "") + (lastDate.getMonth() + 1) + "-" + (lastDate.getDate() < 10 ? "0" : "") + lastDate.getDate();
    return { startDate, endDate }
  },
  tabSelect(e) {
    let {
      index
    } = e.currentTarget.dataset;
    if (this.data.choseType === index || index === undefined) {
      return false;
    } else {
      this.setData({
        choseType: index,
      })
    }

    if (index == 1) {
      var now = new Date(); //当前日期 
      var nowMonth = now.getMonth(); //当前月 
      var nowYear = now.getFullYear(); //当前年 
      //本月开始时间
      var monthStartDate = new Date(nowYear, nowMonth, 1);
      //本月结束时间
      var monthEndDate = new Date(nowYear, nowMonth + 1, 0);
      var beginTime = util.formatDate(Date.parse(monthStartDate));
      var endTime = util.formatDate(Date.parse(monthEndDate));
    } else if (index == 2) {
      var myDate = new Date(); //获取今天日期
      var nowDate = new Date(myDate.setDate(myDate.getDate() - 29));
      var year = nowDate.getFullYear();
      var month = nowDate.getMonth() + 1 < 10 ? "0" + (nowDate.getMonth() + 1) : nowDate.getMonth() + 1;
      var day = nowDate.getDate() < 10 ? "0" + nowDate.getDate() : nowDate.getDate();
      var beginTime = year + "-" + month + "-" + day;
      var endTime = util.toolsFn.getNowTime(2);
    } else if (index == 3) {
      var beginTime = '2022-1-15';
      var endTime = '2022-2-4';
    }

    if (index != 0) {
      this.selectComponent('#date').reset()
      //console.log(beginTime, endTime)
      this.setData({
        show_chose: true,
        'sel_list.start_time': beginTime,
        'sel_list.end_time': endTime,
      }, () => {
        wx.pageScrollTo({
          scrollTop: 0
        })
        this.onReady()
      })
    }
  },
  // 选择查询时间
  dateSubmit(e) {
    let {
      start,
      end
    } = e.detail,
      beginTime = `${start.year}-${start.month}-${start.date}`,
      endTime = `${end.year}-${end.month}-${end.date} `

    if (!start.year || !end.year) {
      return wx.showToast({
        title: '请选择查询时间',
        icon: 'none'
      })
    }
    this.setData({
      show_chose: true,
      'sel_list.start_time': beginTime,
      'sel_list.end_time': endTime,
    }, function () {
      wx.pageScrollTo({
        scrollTop: 0
      })
    })
    this.closeModal();
    this.onReady()
  },
  // 关闭弹框
  closeModal() {
    this.setData({
      choseType: 'no'
    })
  },
  // 重置
  reset() {
    this.setData({
      sel_list: {
        start_time: '',
        end_time: '',
      },
      show_chose: false, //不展示筛选项
      choseType: null,
    }, function () {
      wx.pageScrollTo({ scrollTop: 0 })
    })
    this.onReady()
    // 触发日期组件的重置日期方法
    this.selectComponent('#date').reset()
  },


  onPullDownRefresh: function () {

  },


  onReachBottom: function () {

  },
  onClickLeft() {
    if(this.data.identity == '0'){
      wx.reLaunch({
        url: '/pages/index/index',
      })
      return
    }
    wx.reLaunch({
      url: '/pages/userIndex/userIndex',
    })
  },
  CaseAdd(){
    wx.navigateTo({
      url: '/pages/caseCommon/caseCommon',
    })
  },
})