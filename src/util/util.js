const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const csvStringify = require('csv-stringify');
const csvParser = require('csv-parser');


function stringToNumber(inputString) {
    let sum = 0;
    for (let i = 0; i < inputString.length; i++) {
        sum += inputString.charCodeAt(i);
    }
    return sum;
}


async function wait(t = 1000) {
    await new Promise(resolve => {setTimeout(() => resolve(), t);})
}

function dict2Array(dataList) {
    let keys = new Set();
    dataList.forEach(data => {
        let ks = Object.keys(data);
        ks.forEach(k => keys.add(k))
    })
    keys = Array.from(keys)
    keys = keys.sort((a, b) => b.localeCompare(a));
    const lines =  dataList.map(data => {
        return keys.map(key => data[key]);
    })
    lines.unshift(keys);
    return lines
}


function fixedLengthString(str, length=20) {
    if (str === undefined) {
        str = ''
    }
    str = str + '';
    if (str.length < length) {
        const padding = ' '.repeat(length - str.length);
        return str + padding;
    } else if (str.length > length) {
        return str.slice(0, length);
    } else {
        return str;
    }
}

async function writeCsvFile(filePath, datas) {
    return await new Promise((resolve, reject) => {
        csvStringify.stringify(datas, {header: true}, (err, output) => {
            console.log(output)
            fs.writeFile(filePath, output);
            resolve('')
        })
    })
}
async function readCsvFile(filePath) {
    return await new Promise((resolve, reject) => {
        const results = []
        fsSync.createReadStream(filePath)
          .pipe(csvParser())
          .on('data', (data) => {
              results.push(data);
          })
          .on('end', () => {
              resolve(results)
          });
    })
}

module.exports = {
    wait,
    dict2Array,
    fixedLengthString,
    readCsvFile,
    writeCsvFile,
};
