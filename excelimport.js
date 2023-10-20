import { myhideLoading, myShowLoading ,firstDate} from "../../utils/tools/tools"
const db = wx.cloud.database()
const user_cols = db.collection('users')
const gbh_cols = db.collection('gbh_attendance')
const case_cols = db.collection('gbhCase')
const app = getApp()
// pages/home/home.js
Page({
    /**
     * 页面的初始数据
     */
    data: {
        params:'',
        currentDate: new Date().getTime(),
        minDate: new Date(2010, 10, 0).getTime(),
        date: '',
        show: false,
        cellTitle: 'デーだ選択',
        statusParams: '',
    },
    //取消
    canceled() {
        this.setData({
            show: false
        })
    },
    //取消弹出层
    onClose() {
        this.setData({
            show: false
        });
    },
    //点击显示弹出层
    showPopup() {
        this.setData({
            show: true
        });
    },
    inputed(event) {
        //console.log(event.detail)
        let inputDate = new Date(event.detail)
        let inputYear = inputDate.getFullYear()
        let inputMonth = Number(inputDate.getMonth() + 1)
        let dateSrc = inputYear + '年' + inputMonth + '月'
        this.setData({
            currentDate: event.detail,
            cellTitle: dateSrc,
            show: false,
        });
    },
    onInput(event) {
        //console.log(event.detail)
        let inputDate = new Date(event.detail)
        let inputYear = inputDate.getFullYear()
        let inputMonth = Number(inputDate.getMonth() + 1)
        let dateSrc = inputYear + '年' + inputMonth + '月'
        this.setData({
            currentDate: event.detail,
            cellTitle: dateSrc
        });
    },
    async getStatus(){
        let {
            currentDate
        } = this.data
        var now = new Date(currentDate)
        var mindate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 1);
        var maxdate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        var paramsDate = new Date(now.getFullYear(), now.getMonth(), 10);
        /* console.log(now)
        console.log(mindate)
        console.log(maxdate)
        console.log(paramsDate) */
        let userInfo = await this.getUserStatusInfo()
        const _ = db.command
        await Promise.all(userInfo.map(async v => {
            //console.log(v)
            let statusInfo = await gbh_cols.where({
                openid: v.id,
                day: _.gte(mindate).and(_.lte(maxdate))
            }).get()
            statusInfo = statusInfo.data
            //console.log(statusInfo)
            for (let i = 0; i < statusInfo.length; i++) {
                v.status.push({
                    status: statusInfo[i].status,
                    day: statusInfo[i].day
                })
            }
        }))
        //console.log(userInfo)
        userInfo.unshift(paramsDate)
        return userInfo
    },
    async getUserStatusInfo() {
        let userInfo = []
        let users = await user_cols.get()
        //提取 用户名和id
        await Promise.all(users.data.map(async v => {
            userInfo.push({
                id: v._id,
                nickName: v.nickName,
                status: []
            })
        }))
        return userInfo
    },
    //打印出勤状态
    async inputstatus() {
        myShowLoading()
        let datenow = Date.now()
        let res = await this.getStatus()
        this.setData({
            statusParams: res
        })
        //console.log(res)
        let statusRes = await wx.cloud.callFunction({
            name: "excelimport",
            data: {
                params: res
            }
        })
         wx.cloud.downloadFile({
            fileID: statusRes.result.fileID, 
            success: res => {
                wx.getFileSystemManager().saveFile({
                    tempFilePath: res.tempFilePath,
                    filePath: wx.env.USER_DATA_PATH + "/"  + 'statusDemo'+datenow+'.xlsx',
                    success: tres=>{
                        //console.log("id=="+res.tempFilePath)
                        console.log('保存excel成功', tres) // res.savedFilePath 为一个本地缓存文件路径
                        wx.showToast({
                          title: '文件已保存'
                        })
                        wx.openDocument({
                            filePath: tres.savedFilePath,
                            showMenu: true,
                            success: fres => {
                                console.log('打开excel成功', fres)
                              },
                              fail: fres => {
                                console.log('打开excel失败', fres)
                              },
                        })
                    },
                    fail(tres) {
                        console.log('保存excel失败', tres) // res.savedFilePath 为一个本地缓存文件路径
                      }
                  })
                  wx.cloud.deleteFile({
                    fileList:[statusRes.result.fileID],
                    success: res => {
                        console.log('删除成功')
                      },
                  })
                },
            fail: error=>console.log('通勤状态表下载失败')
          })
          myhideLoading()
    },
  /*   async loadData(){
        var params = {
            gbhCase:[],
            gbhAttendance:null,
        }
        let caseRes = await case_cols.limit(1).get()
        //console.log(caseRes.data[0])
        params.gbhCase[0]=caseRes.data[0]
        //console.log(params)
        //用户和时间数据
        let userInfo=[]
        let userRes = await user_cols.get()
        await Promise.all( userRes.data.map(async v=>{
             userInfo.push({
                 id:v._id,
                 name:v.nickName,
                 dayList:{
                    hourList:[],
                    minuteList:[]
                },
                 total:{
                    hourTotal:0,
                    minuteTotal:0
                 }
             })
        }))
        let {currentDate} = this.data
        let now = new Date(currentDate)
        let mindate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 1)
        let maxdate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
        let maxday = new Date(now.getFullYear(),Number(now.getMonth()+1),0).getDate()
        const _ = db.command
        // console.log(userInfo)
        //console.log(maxday) 
        //根据用户信息获取工作信息
        await Promise.all(userInfo.map(async v=>{
            //console.log(v.id)
            let workInfo = await gbh_cols.where({
                openid:v.id,
                day: _.gte(mindate).and(_.lte(maxdate))
            }).get()
            //console.log(workInfo)
            //console.log(maxday)
            v.dayList.hourList.length=31
            v.dayList.minuteList.length=31
            if(workInfo.data.length==0){
                for(let j=1;j<=maxday;j++){
                    v.dayList.hourList.push(null)
                    v.dayList.minuteList.push(null)
                }
            }else{
                for(let j=1;j<=maxday;j++){
                //console.log(workInfo)
                for(let i=0;i<workInfo.data.length;i++){
                    let nowDate = new Date(workInfo.data[i].day).getDate()
                    if(j==nowDate){
                        v.dayList.hourList[j-1]=workInfo.data[i].hour
                        v.dayList.minuteList[j-1]=workInfo.data[i].minute
                        continue
                    }
                   }
                 }
            }
            let hours=0
            let minute=0
            v.dayList.hourList.forEach(res=>{
                hours += res
            })
            v.dayList.minuteList.forEach(res=>{
                minute += res
            })
            v.total.hourTotal=hours
            v.total.minuteTotal=minute
          }          
        ))
        params.gbhAttendance=userInfo
        console.log(params)
        return params
    }, */
  /*   async inputdate(){
        myShowLoading()
        let datenow = Date.now()
        let res = await this.loadData()
        //console.log(res)
        //let that = this
          let dateRes = await wx.cloud.callFunction({
          name: "exportExcel",
          data: {
            params: res
          }
        })
        //console.log(dateRes)
        wx.cloud.downloadFile({
            fileID: dateRes.result.fileID, 
            success: res => {
              console.log(res.tempFilePath)
              wx.getFileSystemManager().saveFile({
                tempFilePath: res.tempFilePath,
                filePath: wx.env.USER_DATA_PATH + "/"  + 'dateDemo'+datenow+'.xlsx',
                success: tres=>{
                    console.log('保存excel成功', tres) // res.savedFilePath 为一个本地缓存文件路径
                    wx.showToast({
                      title: '文件已保存'
                    })
                    wx.openDocument({
                        filePath: tres.savedFilePath,
                        showMenu: true,
                        success: fres => {
                            console.log('打开excel成功', fres)
                          },
                          fail: fres => {
                            console.log('打开excel失败', fres)
                          },
                    })
                },
                fail(tres) {
                    console.log('保存excel失败', tres) // res.savedFilePath 为一个本地缓存文件路径
                  }
              })
            },
            fail: res=>console.log("通勤表时间下载失败")
          })
          myhideLoading()
        }, */
       //每个用户数组下设置工作信息数组
    /* async userToWork(userArr,id,name){
        let {currentDate} = this.data
        let dateInfo = firstDate(currentDate)
        const _ = db.command
        await Promise.all(userArr.map(async v =>{
            let userWork = await gbh_cols.where({
                caseData:{caseId:id,caseName:name},
                openid:v._id,
                day:_.gte(dateInfo.mindate).and(_.lte(dateInfo.maxdate))
            }).get()
            v.userWorkInfo=[]
            //将得到的用户信息放入workInfo数组中
            v.userWorkInfo=userWork.data
        }))
    }, */
    //将数组按id分类
    classify(array){
        if(array.length!==0){
            let userArr = []
            //console.log(array)
            userArr.push({userInfo:array[0],userWorkInfo:[array[0]]})
            //userArr[0].workInfo.push(array[0])
            for(let i=1;i<array.length;i++){
                //console.log(userArr)
                //console.log(array[i])
                let  x = userArr.findIndex((value) => value.userInfo.openid==array[i].openid)
                //console.log(x)
                if(x==-1){
                    userArr.push({userInfo:array[i],userWorkInfo:[array[i]]})
                }else{
                    userArr[x].userWorkInfo.push(array[i])
                }
            }
            return userArr
        }else{
            return [];
        }
    },
        async getGbhCase(){
            //console.log(dateInfo)
            /* let caseRes = await case_cols.where({
                status:1
            }).get() */
            let caseRes = await case_cols.get()
            let gbhWorkInfo = {
                caseInfo:[]
            }
            gbhWorkInfo.caseInfo = caseRes.data
            let {currentDate} = this.data
            let dateInfo = firstDate(currentDate)
            const _ = db.command
            //获取每个案件下的工作信息
            await Promise.all(gbhWorkInfo.caseInfo.map(async v=>{
                //console.log(v)
                //获取案件下的工作信息
                let workTestRes = await gbh_cols.where({
                    caseData:{caseId:v._id,caseName:v.contractSubject},
                    day:_.gte(dateInfo.mindate).and(_.lte(dateInfo.maxdate))
                }).get()
                //console.log(workTestRes.data)
                //将工作信息按用户id进行分类
                let arr = this.classify(workTestRes.data)
                let userInfo=[]
                for(let i=0;i<arr.length;i++){
                    let userRes = await user_cols.where({
                        _id:arr[i].userInfo.openid
                    }).get()
                    if(userRes.data.length==1){
                        //console.log(arr[i])
                        userInfo[i]=userRes.data[0]
                        userInfo[i].userWorkInfo = arr[i].userWorkInfo
                    }
                }
                //console.log(userInfo)
                v.userInfo=userInfo
            }))
            //将没有人做的案件去掉
            gbhWorkInfo.caseInfo= gbhWorkInfo.caseInfo.filter(v=>{
                return v.userInfo.length!==0
            })
            this.setData({
                gbhWorkInfo:gbhWorkInfo
            })
            //设置用户信息
/* 
            //在每个案件下设置一个用户数组
            await Promise.all(gbhWorkInfo.caseInfo.map(async v=>{
                let userInfo = await user_cols.get()
                v.userInfo = userInfo.data
                //调用改函数在每个用户数组下设置工作信息数组
                await this.userToWork(userInfo.data,v._id,v.contractSubject)
            }))
            this.setData({
                gbhWorkInfo:gbhWorkInfo
            }) */
        },
        async inputworkDate(){
            myShowLoading()
            await this.getGbhCase()
            let {currentDate,gbhWorkInfo} = this.data
            let dateInfo = firstDate(currentDate)
            gbhWorkInfo.paramDate = dateInfo.paramsDate
            //console.log(gbhWorkInfo)
            let dateRes = await wx.cloud.callFunction({
                name: "workDateExport",
                data: {
                    params: gbhWorkInfo
                }
            })
            let datenow = Date.now()
             wx.cloud.downloadFile({
                fileID: dateRes.result.fileID,
                success: res => {
                    console.log(res.tempFilePath)
                    wx.getFileSystemManager().saveFile({
                        tempFilePath: res.tempFilePath,
                        filePath: wx.env.USER_DATA_PATH + "/" + 'dateDemo' + datenow + '.xlsx',
                        success: tres => {
                            console.log('保存excel成功', tres) // res.savedFilePath 为一个本地缓存文件路径
                            wx.showToast({
                                title: '文件已保存'
                            })
                            wx.openDocument({
                                filePath: tres.savedFilePath,
                                showMenu: true,
                                success: fres => {
                                    console.log('打开excel成功', fres)
                                },
                                fail: fres => {
                                    console.log('打开excel失败', fres)
                                },
                            })
                        },
                        fail(tres) {
                            console.log('保存excel失败', tres) // res.savedFilePath 为一个本地缓存文件路径
                        }
                    })
                     wx.cloud.deleteFile({
                        fileList: [dateRes.result.fileID],
                        success: res => {
                            console.log('删除成功')
                        },
                    })
                },
                fail: res => console.log("通勤表时间下载失败")
            })
            myhideLoading()
        },
        /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
      this.setData({
        footerNavListAdmin: app.globalData.footerNavListAdmin,
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