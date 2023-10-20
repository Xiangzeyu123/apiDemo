// 云函数入口文件
const cloud = require('wx-server-sdk')
const ExcelJS = require('exceljs');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
    /**
     * 处理参数和时间
     */
    let userInfo = event.params
    //console.log(userInfo)
    //除了时间  得到这个月的总天数
    let statusArr = ['テレワーク','通勤出社','個人休暇']
    let paramDate = userInfo[0]
    //console.log(paramDate)
    let nowDate = new Date(paramDate)
    //console.log(nowDate)
    //let maxday = 31
    let maxday = new Date(nowDate.getFullYear(), nowDate.getMonth() + 1, 0).getDate()
    let monthNow = Number( nowDate.getMonth()+1)+'月'
    //console.log(maxday)
    /**
     * 处理标题
     */
    //console.log(1)
    const workbook = new ExcelJS.Workbook();
    const export_sheet = workbook.addWorksheet("export");
    export_sheet.mergeCells('A1', 'F2');
    export_sheet.getCell('A1').font = {
        size:16
    }   
    export_sheet.getCell('A1').value = 'テレワーク/出社/休暇　統計表'
    //处理头部
    //console.log(2)
    export_sheet.mergeCells('A3', 'B3');
    let cellA3 = export_sheet.getCell('A3')
    cellA3.font={
        size:14
    }
    cellA3.value="月 / 氏名"
    for(let i =1;i<userInfo.length;i++){
        let cellname = export_sheet.getCell(cellA3.row,cellA3.col+i+1)
        cellname.value=userInfo[i].nickName
    }
    //处理前部
    //console.log(3)
    export_sheet.mergeCells('A4', 'A34');
    let cellA4 = export_sheet.getCell('A4')
    cellA4.value=monthNow
    let cellB4 = export_sheet.getCell('B4')
    cellB4.value=1
    for(let i=1;i<maxday;i++){
        let cellDemo = export_sheet.getCell(cellB4.row+i,cellB4.col)
        cellDemo.value=i+1
    }
    /**
     * 遍历 赋值
     */
    //console.log(4)
    let cellC4 = export_sheet.getCell('C4')
    let col = userInfo.length-1
    for(let i = 1;i<=col;i++){
        for(let j = 1;j<=maxday;j++){
            let cellDemo = export_sheet.getCell(cellC4.row+j-1,cellC4.col+i-1)
            cellDemo.dataValidation = {
                type: 'list',
                allowBlank: true,
                formulae: ['"テレワーク,通勤出社,個人休暇"'],
              };
            //let name = export_sheet.getCell(cellDemo.row-1,cellDemo.col+i-1)
            let day = export_sheet.getCell(cellC4.row+j-1,cellC4.col-1)
            let infoArr = userInfo[i].status
            //console.log(infoArr[i])
            for(let k=0;k<infoArr.length;k++){
                let userDay = new Date(infoArr[k].day).getDate()
                if(day==userDay){
                    /* console.log(userDay)
                    console.log(infoArr[k].status) */
                    let status = statusArr[infoArr[k].status]
                    cellDemo.value=status
                }
            }
        }
    }
    let datenow = Date.now()
    let filename = 'statusDemo'+datenow+'.xlsx'
    const buffer = await workbook.xlsx.writeBuffer();
      return await cloud.uploadFile({
        cloudPath:filename,
        fileContent: buffer, 
      }) 
}