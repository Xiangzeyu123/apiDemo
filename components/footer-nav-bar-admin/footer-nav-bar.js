Component({
  properties: {
      navList: {
          type: Array,
          default: () => {
              return [{
                      icon: 'home-o',
                      text: '首页',
                      url: '/pages/userIndex/userIndex'
                  },
                  {
                      icon: 'down',
                      text: '案件导出',
                      url: '/pages/excelimport/excelimport'
                  }
              ]
          }
      },
  },
  data: {
      active: 0
  },

  methods: {
      onChange(event) {
          // 当反复点击当前的页面，就不做切换操作了
          if (event.detail !== this.data.active) {
              this.setData({
                  active: event.detail
              });
              console.log("/"+this.data.navList[event.detail].url)
              wx.switchTab({
                  url: this.data.navList[event.detail].url
              });
          }
          this.triggerEvent('onFooterNavChange', event)
      },

      init() {
          const page = getCurrentPages().pop();
          this.setData({
              active: this.data.navList.findIndex(item => item.url === `/${page.route}`)
          });
      }
  }
});