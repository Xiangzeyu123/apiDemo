import {
    myhideLoading,
    myShowLoading,
    firstDate,
    myShowToast
} from "../../utils/tools/tools"
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
        currentDate: new Date().getTime(),
        minDate: new Date(2010, 10, 0).getTime(),
        show: false,
        gbhWorkInfo: '',
        cellTitle: '',
        statusParams: '',
    },
    /**
     * 取消时间选择
     */
    canceled() {
        this.setData({
            show: false
        })
    },
    /**
     * 隐藏弹出层
     */
    onClose() {
        this.setData({
            show: false
        });
    },
    /**
     * 点击显示弹出层
     */
    showPopup() {
        this.setData({
            show: true
        });
    },
    /**
     * 时间选择 监听输入完成
     * @param {*} event 
     */
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
    /**
     * 时间选择 监听数据源改变
     * @param {}} event 
     */
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
    /**
     * 获取用户工作状态信息
     */
    async getStatus() {
        let {
            currentDate
        } = this.data
        var now = new Date(currentDate)
        var mindate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 1);
        var maxdate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        var paramsDate = new Date(now.getFullYear(), now.getMonth(), 10);
        let userInfo = await this.getUserStatusInfo()
        const _ = db.command
        await Promise.all(userInfo.map(async v => {
            //console.log(v)
            let statusInfo = await gbh_cols.where({
                openid: v.id,
                day: _.gte(mindate).and(_.lte(maxdate))
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
        userInfo.unshift(paramsDate)
        this.setData({
            statusParams:userInfo
        })
    },
    async getUserStatusInfo() {
        let userInfo = []
        let users = await user_cols.get()
        //提取 用户名和id
        await Promise.all(users.data.map(async v => {
            userInfo.push({
                id: v._id,
                nickName: v.nickName,
                name:v.name,
                status: []
            })
        }))
        return userInfo
    },
    /**
     * 返回按钮
     */
    onClickLeft() {
        wx.reLaunch({
            url: '/pages/login/login',
        })
    },
    /**
     * 打印出勤状态
     */
    async inputstatus() {
        if (this.reportDateCheck()) {
            await myShowToast("選択の時間が今の時間の前にしてください")
            return
        } else {
            myShowLoading()
            await this.getStatus()
            let {statusParams} = this.data
            console.log(statusParams)
            let statusRes = await wx.cloud.callFunction({
                name: "excelimport",
                data: {
                    params: statusParams
                }
            })
            await this.flowingFile(statusRes)
            myhideLoading()
        }
    },
    /**
     * 将工作信息按用户id进行分类
     * @param {*} array 
     */
    classify(array) {
        if (array.length !== 0) {
            let userArr = []
            //console.log(array)
            userArr.push({
                userInfo: array[0],
                userWorkInfo: [array[0]]
            })
            //userArr[0].workInfo.push(array[0])
            for (let i = 1; i < array.length; i++) {
                //console.log(userArr)
                //console.log(array[i])
                let x = userArr.findIndex((value) => value.userInfo.openid == array[i].openid)
                //console.log(x)
                if (x == -1) {
                    userArr.push({
                        userInfo: array[i],
                        userWorkInfo: [array[i]]
                    })
                } else {
                    userArr[x].userWorkInfo.push(array[i])
                }
            }
            return userArr
        } else {
            return [];
        }
    },
    /**
     * 获取案件信息 工作时间信息 用户信息
     */
    async getGbhCase() {
        let caseRes = await case_cols.get()
        let gbhWorkInfo = {
            caseInfo: []
        }
        gbhWorkInfo.caseInfo = caseRes.data
        let {
            currentDate
        } = this.data
        let dateInfo = firstDate(currentDate)
        const _ = db.command
        //获取每个案件下的工作信息
        await Promise.all(gbhWorkInfo.caseInfo.map(async v => {
            //console.log(v)
            //获取案件下的工作信息
            let workTestRes = await gbh_cols.where({
                caseData: {
                    caseId: v._id,
                    caseName: v.contractSubject
                },
                day: _.gte(dateInfo.mindate).and(_.lte(dateInfo.maxdate))
            }).get()
            //console.log(workTestRes.data)
            //将工作信息按用户id进行分类
            let arr = this.classify(workTestRes.data)
            let userInfo = []
            for (let i = 0; i < arr.length; i++) {
                let userRes = await user_cols.where({
                    _id: arr[i].userInfo.openid
                }).get()
                if (userRes.data.length == 1) {
                    //console.log(arr[i])
                    userInfo[i] = userRes.data[0]
                    userInfo[i].userWorkInfo = arr[i].userWorkInfo
                }
            }
            //console.log(userInfo)
            v.userInfo = userInfo
        }))
        //将没有人做的案件去掉
        gbhWorkInfo.caseInfo = gbhWorkInfo.caseInfo.filter(v => {
            return v.userInfo.length !== 0
        })
        this.setData({
            gbhWorkInfo: gbhWorkInfo
        })
    },

    /**
     * 报告时间校验
     */
    reportDateCheck() {
        let currentDate = this.data.currentDate
        let dateInfo = firstDate(currentDate)
        let reportMonth = Number(dateInfo.paramsDate.getMonth() + 1)
        let nowMonth = Number(new Date().getMonth() + 1)
        if (reportMonth > nowMonth) {
            return true
        } else {
            return false
        }
    },
    /**
     * 下载预览删除文件
     */
    async flowingFile(dateRes) {
        let datenow = Date.now()
        wx.cloud.downloadFile({
            fileID: dateRes.result.fileID,
            success: res => {
                console.log(res.tempFilePath)
                wx.getFileSystemManager().saveFile({
                    tempFilePath: res.tempFilePath,
                    filePath: wx.env.USER_DATA_PATH + "/" + '勤務報告' + datenow + '.xlsx',
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
            fail: res => console.log("勤務報告下载失败")
        })
    },
    /**
     * 导出工作时间报告
     */
    async inputworkDate() {
        //获取需要导出的报告时间
        if (this.reportDateCheck()) {
            await myShowToast("選択の時間が今の時間の前にしてください")
            return
        } else {
            myShowLoading()
            await this.getGbhCase()
            let {
                currentDate,
                gbhWorkInfo
            } = this.data
            let dateInfo = firstDate(currentDate)
            gbhWorkInfo.paramDate = dateInfo.paramsDate
            //console.log(gbhWorkInfo)
            if (gbhWorkInfo.caseInfo.length == 0) {
                await myShowToast("選択した月が勤務情報がありません")
                return
            }
            let dateRes = await wx.cloud.callFunction({
                name: "workDateExport",
                data: {
                    params: gbhWorkInfo
                }
            })
            await this.flowingFile(dateRes)
            myhideLoading()
        }
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