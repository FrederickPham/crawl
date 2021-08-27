const puppeteer = require('puppeteer')
const _ = require('lodash')
const fs = require('fs')
const bluebird = require('bluebird')
const data = require('./data.json');
const outData = require('./outData.json')




const _delay = async (ms) => {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}


const run = async (code) => {

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`https://www.trackingmore.com/all/en/${code}`);

    // Get the "viewport" of the page, as reported by the page.
    const dimensions = await page.evaluate(() => {


        let time = document.querySelector("#tbResultChange").lastChild.children[0].children[1].children[0].textContent
        let node = document.querySelector("#tbResultChange").lastChild.children[0].children[1].children[1].textContent

        return {
            time: time.replace(/  +/g, '').replace(/\n/g, ''),
            node: node.replace(/  +/g, '').replace(/\n/g, '')
        }
    });

    await browser.close();

    console.log('Dimensions:', dimensions);




    return dimensions
}



const read = async () => {
    await doc.useServiceAccountAuth({
        client_email: config.client_email,
        private_key: config.private_key
    });

    await doc.loadInfo(); // loads document properties and worksheets

    const sheet = doc.sheetsByIndex[0];
    console.log(sheet.title, sheet.rowCount)
    const rows = await sheet.getRows()

    const test = rows.map(item => {
        if (item.Date === 'Invalid date') return item
    }).filter(Boolean)
    console.log(test.length)

    // for (let i = rows.length - 4; i > 4000; i--) {
    //     await _delay(1500)
    //     const trackNumber = rows[i] && rows[i].Tracking;

    //     if (trackNumber) {
    //         const Status = rows[i].Status
    //         if (Status.includes('You')) {
    //             const data = await run(`https://www.tracking.my/singpost/${trackNumber}`)
    //             if (!data || data.Status.includes('You') || data.Date.includes('break')) {
    //                 await _delay(3000)
    //             }

    //             if (data && data.Status) {

    //                 rows[i]["Status"] = data.Status
    //                 rows[i]["Date"] = moment(data.Date).format('DD/MM/YYYY')
    //                 await rows[i].save()
    //             }
    //         }
    //     }
    // }
}

const cvs = async () => {
    console.log({ type: typeof outData, outData })
    const _data = JSON.parse(JSON.stringify(outData))


    try {

        await bluebird.each(data, async (e) => {

            const checkExisted = _.find(_data, (_d) => {
                console.log({
                    test: e['tracking number'], test2: _d['tracking number']
                })
                return e['tracking number'] === _d['tracking number']
            })
            console.log({ checkExisted })
            if (!checkExisted) {
                const crw = await run(e['tracking number'])
                const d = {
                    ...e,
                    time: crw.time,
                    last_node: crw.node
                }
                _data.push(d)
            }

        })

    } catch (error) {
        console.error(`error`, error)
    } finally {
        fs.writeFileSync('./outData.json', JSON.stringify(_data))
        // cvs()
    }




}

setImmediate(async () => {
    cvs()
})
