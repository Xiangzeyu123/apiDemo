import {
    timestampToDate,
    showToast,
    callFunction,
    myShowLoading,
    myhideLoading,
    myShowToast
} from '../../utils/tools/tools'
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        id: null,
        username: null,
        nickName: null,
        password: null,
        identity: null,
        name:null,
        columns: ['社員', '管理職'],
        //役割選択弹出层
        statusShow: false,
        ifUpdate: false
    },
    onClose() {
        this.setData({
            statusShow: false
        });
    },
    showPopup() {
        this.setData({
            statusShow: true
        });
    },
    onCancel() {
        this.setData({
            statusShow: false
        });
    },
    onConfirm(value) {
        this.setData({
            identity: value.detail.index,
            statusShow: false
        })
    },
    async onLoad(options) {
        await myShowLoading()
        if (options !== undefined && options !== "" && options !== null) {
            if (options.hasOwnProperty("id") && options.id != '') {
                await this.loadUserInfo(options.id)
            }
        }
        await myhideLoading()
    },
    async loadUserInfo(id) {
        let params = {
            action: "selectOne",
            where: {
                _id: id
            }
        }
        let res = await callFunction("userProject", params)
        this.setData({
            nickName: res.result.data[0].nickName,
            identity: res.result.data[0].identity,
            id: res.result.data[0]._id,
            username: res.result.data[0].username,
            name:res.result.data[0].name,
            ifUpdate: true
        })
    },
    checkParams(p) {
        if (p.password == null || p.password == "") {
            myShowToast("パスワードを入力してください")
            return false
        }
        if (p.name == null || p.name == "") {
            myShowToast("ユーザー名を入力してください")
            return false
        }
        if (p.nickName == null || p.nickName == "") {
            myShowToast("ユーザーIDを入力してください")
            return false
        }
        if (p.identity !== 0 && p.identity !== 1) {
            myShowToast("役割を選択してください")
            return false
        }
        if (p.username == null || p.username == "") {
            myShowToast("社員番号を入力してください")
            return false
        }
        return true
    },
    async submitData() {
        let userInfo = {
            id: this.data.id,
            identity: this.data.identity,
            nickName: this.data.nickName,
            password: this.data.password,
            username: this.data.username,
            name:this.data.name
        }
        if (!this.checkParams(userInfo)) {
            return
        }
        if (this.data.ifUpdate) { //更新
            let params = {
                action: "update",
                data: {
                    password: userInfo.password
                },
                where: {
                    _id: userInfo.id
                }
            }
            let res = await callFunction("userProject", params)
            //console.log(res)
            await myShowToast("修正完了しました")
            wx.reLaunch({
                url: '/pages/userIndex/userIndex',
            })
        } else { //添加
            let res = await this.selectOne();
            console.log(res)
            if (!res) {
                await myShowToast("このユーザーもう存在しています")
                return
            } else {
                let params = {
                    action: "add",
                    data: userInfo,
                }
                await callFunction("userProject", params)
                //console.log(res)
                await myShowToast("追加完了しました")
                wx.reLaunch({
                    url: '/pages/userIndex/userIndex',
                })
            }
        }
    },
    async selectOne() {
        const db= wx.cloud.database()
        const _  = db.command;
        let params = {
            action: "selectOne",
            where: {
                username:this.data.username,
                nickName:this.data.nickName
            },
            or:true
        }
        let res = await callFunction("userProject", params)
        console.log(res)
        return res.result.data.length==0
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
    onShow() {},

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