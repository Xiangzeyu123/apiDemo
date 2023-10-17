// 云函数入口文件
const cloud = require('wx-server-sdk')
const ExcelJS = require('exceljs');
cloud.init({ env: 'gbh-4gqt7w1a11eccda8' }) // 使用当前云环境
function dateForDay(date){
    let now = new Date(date)
    return now.getDate()
}
function addSheet(workCase,workbook,dateInfo){
    let workSheet = workbook.addWorksheet(workCase.contractSubject);
    //数组A列的宽度
    //监督员
    let cellA3 = workSheet.getCell('A3')
    cellA3.value ="監督員："
    workSheet.getCell('C3').value=workCase.supervisor
    workSheet.getCell('J3').value='御中'
    workSheet.getColumn(cellA3.col).width =16.5
    //契約番号
    workSheet.getCell('A8').value='契約番号：'
    workSheet.getCell('C8').value = workCase.contractNumber
    //契約件名：
    workSheet.getCell('A10').value='契約件名：'
    workSheet.getCell('C10').value=workCase.contractSubject
    //会社名：
    workSheet.getCell('X8').value='会社名：'
    workSheet.getCell('AA8').value=workCase.companyName
    //実施責任者：
    workSheet.getCell('X10').value='実施責任者：'
    workSheet.getCell('AA10').value=workCase.Director
    //作　業　時　間　内　訳
    workSheet.mergeCells('B5', 'AI5');
    let cellB5 = workSheet.getCell('B5')
    cellB5.value='作　業　時　間　内　訳'
    cellB5.alignment = { vertical: 'middle', horizontal: 'center' };
    cellB5.font = { bold:true };
    //时间
    let cellB6=workSheet.getCell('B6')
    workSheet.mergeCells('B6', 'AI6')
    let date = '(' + dateInfo.year + '年' +dateInfo.month+'月分)'
    cellB6.value=date
    cellB6.alignment = { vertical: 'middle', horizontal: 'center' };
    cellB6.font = { bold:true };
    //设置表头页
    //1.设置名字和小时分钟
    workSheet.mergeCells('A13','B13')
    let cellA13 = workSheet.getCell('A13')//名字格
    let cellC13 = workSheet.getCell('C13')//时间格
    cellA13.value='技術者名'
    let minuteArr = []
    let hourArr = []
    for(let i=0;i<workCase.userInfo.length;i++){
        //设置名字 
        let cellA13Next = workSheet.getCell(cellC13.row+1+i*2,cellC13.col-2)
        let cellA13Next2 = workSheet.getCell(cellC13.row+2+i*2,cellC13.col-1)
        workSheet.mergeCells(cellC13.row+1+i*2,cellC13.col-2,cellC13.row+2+i*2,cellC13.col-1)
        cellA13Next.value=workCase.userInfo[i].name
        //设置时间和分钟
        let hourCell = workSheet.getCell(cellC13.row+i*2+1,cellC13.col)
        hourCell.value='時間'
        let minuteCell = workSheet.getCell(cellC13.row+i*2+2,cellC13.col)
        minuteCell.value='分'
        //设置求和
        let sumHourCell = workSheet.getCell(hourCell.row,hourCell.col+dateInfo.maxday+1) //要添加求和公式的单元格
        let sumMinuteCell = workSheet.getCell(minuteCell.row,minuteCell.col+dateInfo.maxday+1) //要添加求和公式的单元格
        hourArr.push(sumHourCell)
        minuteArr.push(sumMinuteCell)
        let hourFirstDay = workSheet.getCell(hourCell.row,hourCell.col+1)//求和的第一个单元格
        let hourLastDay = workSheet.getCell(hourCell.row,hourCell.col+dateInfo.maxday)//求和的最后第一个单元格

        let minuteFirstDay = workSheet.getCell(minuteCell.row,minuteCell.col+1)//求和的第一个单元格
        let minuteLastDay = workSheet.getCell(minuteCell.row,minuteCell.col+dateInfo.maxday)//求和的最后第一个单元格

        const minuteFormula = `MOD(SUM(${minuteFirstDay._address}:${minuteLastDay._address}),60)`;
        const hourFormula = `SUM(${hourFirstDay._address}:${hourLastDay._address})`+'+('+`SUM(${minuteFirstDay._address}:${minuteLastDay._address})`+'-'+`${minuteFormula}`+')'+'/60';
        /* console.log(minuteFormula)
        console.log(hourFormula) */
        sumHourCell.value = { formula: hourFormula };
        sumMinuteCell.value={ formula: minuteFormula };
        //最终合计
        if(i==workCase.userInfo.length-1){
          //设置黑色线框
                      for(let x=cellA13.row;x<=sumMinuteCell.row;x++){
                            for(let y=cellA13.col;y<=sumMinuteCell.col;y++){
                                if(x==cellA13.row){
                                    workSheet.getCell(x,y).border={
                                        top: { style: 'thin' },
                                    }
                                }
                                if(x==sumMinuteCell.row){
                                    workSheet.getCell(x,y).border={
                                        bottom: { style: 'thin' },
                                    }
                                }
                                if(y==sumMinuteCell.col){
                                    if(x==cellA13.row){
                                        workSheet.getCell(x,y).border={
                                            right: { style: 'thin' },
                                            top: { style: 'thin' },
                                        }
                                    }else if(x==sumMinuteCell.row){
                                        workSheet.getCell(x,y).border={
                                            right: { style: 'thin' },
                                            bottom: { style: 'thin' },
                                        }
                                    }else{
                                        workSheet.getCell(x,y).border={
                                            right: { style: 'thin' }
                                        }
                                    }
                                }
                            }
                        }
            //合计
            console.log(sumMinuteCell._address)
            workSheet.mergeCells(sumMinuteCell.row+1,sumMinuteCell.col-2,sumMinuteCell.row+2,sumMinuteCell.col-2)
            workSheet.getCell(sumMinuteCell.row+1,sumMinuteCell.col-2).value='合計'
            workSheet.getCell(sumMinuteCell.row+1,sumMinuteCell.col-1).value='時間'
            workSheet.getCell(sumMinuteCell.row+2,sumMinuteCell.col-1).value='分'
            let lastHour = workSheet.getCell(sumMinuteCell.row+1,sumMinuteCell.col)
            let lastMinute = workSheet.getCell(sumMinuteCell.row+2,sumMinuteCell.col)
            //分钟公式
            let minuteFunc='MOD('
            let minuteAll ='('
            console.log(minuteArr)
            console.log(hourArr)
            for(let x=0;x<minuteArr.length;x++){
                if(x==0){
                    minuteFunc+=`${minuteArr[x]._address}`
                    minuteAll+=`${minuteArr[x]._address}`
                }else{
                    minuteFunc+='+'+`${minuteArr[x]._address}`
                    minuteAll+='+'+`${minuteArr[x]._address}`
                }
                if(x==minuteArr.length-1){
                    console.log(123)
                    minuteAll+=')'
                    minuteFunc+= ',60)'
                }
            }
            let hourFunc = ''
            for(let x=0;x<hourArr.length;x++){
                if(x==0){
                    hourFunc += `${hourArr[x]._address}`
                }else{
                    hourFunc += '+'+`${hourArr[x]._address}`
                }
                if(x==hourArr.length-1){
                    hourFunc += '+('+ `${minuteAll}`+'-'+`${minuteFunc}`+')/60'
                }
            }
            console.log(minuteFunc)
            console.log(minuteAll)
            console.log(hourFunc)
            lastMinute.value=({formula:minuteFunc})
            lastHour.value= ({formula:hourFunc})
        }
    }
    //设置日期
    //console.log(dateInfo.maxday)
    for(let i=1;i<=dateInfo.maxday;i++){
        let daycell = workSheet.getCell(cellC13.row,cellC13.col+i)
        daycell.value=i
        if(i==dateInfo.maxday){
            workSheet.getCell(daycell.row,daycell.col+1).value='合計'
        }
    }
    //设置内容
    for(let i =0;i<workCase.userInfo.length;i++){//名字
        if(workCase.userInfo[i].userWorkInfo.length==0){
            continue;
        }else{
            for(let w=0;w<workCase.userInfo[i].userWorkInfo.length;w++){
                let today = dateForDay(workCase.userInfo[i].userWorkInfo[w].day)
                workSheet.getCell(cellC13.row+i*2+1,cellC13.col+today).value=Number(workCase.userInfo[i].userWorkInfo[w].hour)
                workSheet.getCell(cellC13.row+i*2+2,cellC13.col+today).value=Number(workCase.userInfo[i].userWorkInfo[w].minute)
            }
        }
    }
    return workbook
}
// 云函数入口函数
exports.main = async (event, context) => {
    let workbook = new ExcelJS.Workbook();
    let {params} = event
    console.log(params)
    let datenow = new Date(params.paramDate)
    console.log(datenow)
    let year = datenow.getFullYear()
    let month = Number(datenow.getMonth()+1)
    let dateInfo={
        year:year,
        month:month,
        maxday:new Date(year,month,0).getDate()
    }
    for(let i=0;i<params.caseInfo.length;i++){
       workbook = addSheet(params.caseInfo[i],workbook,dateInfo)
    }

    let dateIndex = Date.now()
    let filename = 'workStatus'+dateIndex+'.xlsx'
    const buffer = await workbook.xlsx.writeBuffer();
    return await cloud.uploadFile({
        cloudPath:filename,
        fileContent: buffer, 
    }) 
}