import {
    formateDate,
    callFunction,
    myhideLoading,
    myShowLoading,
    showToast,
    myShowToast,
} from '../../utils/tools/tools'
var app = getApp()
var d = new Date(); //2022-8-11
var row_arrStatus = []
Page({
    data: {
        minHour: 0,
        maxHour: 23,
        workHoursRange: {
            minHour: 0,
            maxHour: 23
        },
        closingTtimeRange: {
            minHour: 0,
            maxHour: 23
        },
        closingTtime: null,
        workHours: null,
        selectTime: "",
        spot: [],
        contractNumber: null,
        Director: null,
        contractSubject: {
            name: null,
            index: null,
            id: null
        },
        supervisor: null,
        workStatus: "",
        showDatetime: "",
        show: false,
        showFrom: false,
        showStatus: false,
        isShow: false,
        showLk: false,
        statusOperate: false,
        columns: [],
        caseList: [],
        workStatusData: '',
        minDate: new Date().getTime(),
        maxDate: new Date(2019, 10, 1).getTime(),
        currentDate: new Date().getTime(),
        formatter(type, value) {
            if (type === 'year') {
                return `${value}年`;
            }
            if (type === 'month') {
                return `${value}月`;
            }
            return value;
        },
        // currentWeek: 10,
        workDataList: [],
        weekList: [],
        current: {},
        submitDataList: []
    },
    datetimeClose() {
        this.setData({
            showDatetime: ""
        })
    },
    getCaseList() {
        //console.log(getCaseList)
        var getCaseList = this.data.caseList,
            columns = []
        getCaseList.forEach(item => {
            columns.push(item.contractSubject)
        })
        //console.log(columns)
        this.setData({
            columns: columns,
            showStatus: true,
        })
    },
    setworkHours(event) {
        //console.log(event)
        this.setData({
            workHours: event.detail,
            showDatetime: ""
        })
    },
    setclosingTtime(event) {
        this.setData({
            closingTtime: event.detail,
            showDatetime: ""
        })
    },
    showAttendanceTime() {
        this.setData({
            showDatetime: 'workHours'
        })
    },
    onCloseShow() {
        this.setData({
            showDatetime: ''
        })
    },
    retirementTime() {
        this.setData({
            showDatetime: 'closingTtime'
        })
    },
    selectCase() {
        this.setData({
            statusOperate: false
        })
        wx.navigateTo({
            url: '/pages/Allattendance/Allattendance',
        })
    },
    // onClickLeft() {
    //   wx.reLaunch({
    //     url: '/pages/home/home',
    //   })
    // },
    onInput(event) {
        this.setData({
            currentDate: event.detail,
        });
    },
    onDisplay() {
        this.setData({
            show: true
        });
    },
    Operate() {
        // this.setData({
        //   statusOperate: true
        // })
    },
    onCloseOperate() {
        this.setData({
            statusOperate: false
        })
    },
    showPopup(e) {
        this.setData({
            show: true
        });
    },
    showLk(e) {
        this.setData({
            showLk: true
        });
    },
    setContentGHB(e) {
        // console.log(e)
        // var row_arr = e.currentTarget.id.split('.');
        row_arr.push(e.detail.value)
        this.modify(row_arr)
    },

    modify(row_arr) {},
    onChange(event) {
        //console.log(event.detail.index)
        var columns = this.data.columns
        if (columns[0] == '在宅' && columns[1] == '出社') {
            //console.log(event.detail)
            if (event.detail.index == 2) {
                // console.log(1)
                this.setData({
                    workHours: null,
                    closingTtime: null,
                    workStatus: event.detail,
                    showStatus: false
                })
                return
            }
            this.setData({
                /* closingTtime: '18:30',
                workHours: '9:30', */
                workStatus: event.detail,
                showStatus: false
            })
        } else {
            this.setData({
                'contractSubject.name': event.detail.value,
                'contractSubject.index': event.detail.index,
                'contractSubject.id': null,
                showStatus: false
            })
        }
    },
    showStatus(e) {
        this.setData({
            showStatus: true,
            columns: ['在宅', '出社', '休暇']
        });
    },
    async submitData() {
        myShowLoading()
        var {
            closingTtime,
            workHours,
            selectTime,
            workStatus,
            workDataList,
            caseList,
            contractSubject
        } = this.data,
            lock = 0,
            params = {
                data: {
                    openid: this.data.openid,
                    hour: 0,
                    beginTime: workHours,
                    endTime: closingTtime,
                    minute: 0,
                    day: selectTime,
                    status: workStatus.index,
                    caseData: {
                        // caseId:caseList[contractSubject.index]._id,
                        // caseName:contractSubject.name
                        caseId: null,
                        caseName: null
                    }
                },
                doc: {
                    _id: ""
                },
                action: 'add'
            }
        if (contractSubject.name == null || contractSubject.name == undefined) {
            showToast('案件はまだ選択しません', 'error', 1000)
            return
        }
        if (contractSubject.name != null && contractSubject.id != null && contractSubject.index == null) {
            params.data.caseData.caseId = contractSubject.id
            params.data.caseData.caseName = contractSubject.name
        } else if (contractSubject.name != null && contractSubject.id == null && contractSubject.index != null) {
            params.data.caseData.caseId = caseList[contractSubject.index]._id,
                params.data.caseData.caseName = contractSubject.name
        }
        if (workStatus.index == undefined || workStatus.index == null) {
            showToast('作業状態はまだ選択しません', 'error', 1000)
            return
        }
        let workDateInfo;
        var pattern1 = /^(0|[1-9]|1[0-9]|2[0-4])$/
        var pattern2 = /^(0|[1-9]|[1-5][0-9]|60)$/
        console.log(pattern1.test(this.data.workHours))
        if (workStatus.value!=='休暇'&&!pattern1.test(this.data.workHours)) {
            myShowToast("正しい時間を入力してください")
            this.setData({
                workHours: null
            })
            return
        }
        console.log(pattern2.test(this.data.closingTtime))
        if (workStatus.value!=='休暇'&&!pattern2.test(this.data.closingTtime)) {
            myShowToast("正しい分を入力してください")
            this.setData({
                closingTtime: null
            })
            return
        }
        workDateInfo = {
            hour: this.data.workHours,
            minute: this.data.closingTtime
        }

        /* var endArry = 0
        var biginArry = 0
        if (closingTtime == null && workHours == null) {
          params.data.hour = 0
          params.data.minute = 0
        } else {
          endArry = closingTtime.split(':')
          biginArry = workHours.split(':')
          params.data.hour = Number(endArry[0]) - Number(biginArry[0]) - 1
          params.data.minute = Number(endArry[1]) - Number(biginArry[1])
        } */
        await Promise.all(this.data.workDataList.map(async item => {
            if (item.day == selectTime) {
                //console.log(item.day, selectTime, item)
                params.action = 'update'
                params.doc._id = item._id
                params.data.day = item.day
                params.data.hour = workDateInfo.hour
                params.data.minute = workDateInfo.minute
                await callFunction('attendanceProject', params).then((res) => {
                    // console.log(res)
                    lock = 1
                })
            }
        }))
        wx.setStorageSync('workData', "")
        wx.setStorageSync('thisMonthCase', "")
        myhideLoading()
        if (lock == 1) {
            wx.reLaunch({
                url: '/pages/JumpToPage/JumpToPage',
            })
            return
        }
        params.data.hour = workDateInfo.hour
        params.data.minute = workDateInfo.minute
        await callFunction('attendanceProject', params).then((res) => {
            if (res.result._id != null) {
                wx.reLaunch({
                    url: '/pages/JumpToPage/JumpToPage',
                })
            }
        })
        return
    },

    selectView(e) {

    },
    onCloseStatus() {
        this.setData({
            showStatus: false
        });
    },
    onCloseForm() {
        this.setData({
            showFrom: false
        });
    },
    onCloseLk() {
        this.setData({
            showLk: false
        });
    },
    formatDate(date) {
        date = new Date(date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    },
    onConfirm(event) {
        this.setData({
            show: false,
            date: this.formatDate(event.detail),
        });
    },
    getDetail(e) {
        let {
            item
        } = e.currentTarget.dataset;
        this.setData({
            current: item,
            isShow: true
        })
    },
    close() {
        this.setData({
            isShow: false
        })
    },
    dateChange(even) {
        //console.log(even)
        this.setData({
            date: even.detail.dateString
        })
    },
    dateTap(even) {
        var Today = formateDate(new Date()),
            dateList = Today.split("-"),
            selectDateList = '',
            selectTime = '',
            workDataList = this.data.workDataList
        if (even.detail.dateString == undefined) {
            selectDateList = formateDate(new Date()).split("-")
            selectTime = Today
        } else {
            selectDateList = even.detail.dateString.split("-")
            selectTime = even.detail.dateString
        }
        var today = Number(dateList[0] + "." + dateList[1] + dateList[2]),
            selectday = Number(selectDateList[0] + "." + selectDateList[1] + selectDateList[2])
        if (today - selectday < 0) {
            // showToast("当前日期非填报日期", "error", 1000)
            return
        }
        var columns = ['在宅', '出社', '休暇']
        this.setData({
            'contractSubject.name': null,
            'contractSubject.index': null,
            'workStatus': ''
        })
        /*   workDataList.forEach((item) => {
              console.log(item)
              console.log(selectTime) */
        let loopflag = false
        for (let i = 0; i < workDataList.length; i++) {
            if (workDataList[i].day == selectTime) {
                loopflag = true
                this.setData({
                    closingTtime: workDataList[i].minute,
                    workHours: workDataList[i].hour,
                    selectTime: workDataList[i].day,
                    showFrom: true,
                    'contractSubject.name': workDataList[i].caseData.caseName,
                    'contractSubject.id': workDataList[i].caseData.caseId,
                    workStatus: {
                        value: columns[workDataList[i].status],
                        index: workDataList[i].status
                    }
                })
                if (loopflag) {
                    break
                }
            }
        }

        if (!loopflag) {
            this.setData({
                workHours: null,
                closingTtime: null,
            })
        }
        /*   }) */
        this.setData({
            date: even.detail.dateString,
            selectTime: selectTime,
            showFrom: true
        })
    },
    dateChangelk(even) {
        //console.log(even.detail.dateString)
        this.setData({
            workingHours: even.detail.year + "-" + even.detail.month
        })
    },
    async onShow() {
        const openid = app.globalData.userInfo.openid
        let footerNavComp = this.selectComponent('#footer-nav-bar-id');
        let time = new Date()
        footerNavComp.init()
        this.setData({
            date: formateDate(time),
            openid: openid
        })
        // await this.getData(openid,formateDate(time))
    },
    async onLoad() {
        const openid = app.globalData.userInfo.openid
        var prohibitKey = null
        let time = new Date()
        this.setData({
            footerNavList: app.globalData.footerNavList,
            date: formateDate(time),
            prohibitKey,
            openid: openid
        })
        await this.getData(openid, formateDate(time))
    },
    async getData(openid, today) {
        // myShowLoading()
        var workDataList = [],
            spot = [],
            params = {
                action: 'selectAll',
                data: {
                    todMonth: '2019-01-01',
                    today: today,
                    openid: openid
                },
                where: {
                    beginTime: null,
                    endTime: null
                }
            },
            caseList = []
        await callFunction('attendanceProject', params).then((res) => {
            workDataList = res.result.data
        })
        workDataList.forEach((item, index) => {
            var request = {
                day: formateDate(new Date(item.day)),
                status: item.status
            }
            spot.push(request)
            workDataList[index].day = request.day
        })
        await callFunction('caseProject', params).then((res) => {
            caseList = res.result.data
        })
        this.setData({
            workDataList: workDataList,
            spot: spot,
            caseList: caseList
        })
        // myhideLoading()
    },
    onExit() {
        this.setData({
            showFrom: false
        })
    },
})