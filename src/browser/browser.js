const path = require('path');
const puppeteer = require('puppeteer');
const {exec} = require('child_process');

const { getLogger } = require('../util/log');
const { wait } = require('../util/util');
const config = require('../config');

const logger = getLogger('browser');


class BrowserOperator {
    constructor(instanceId, portStart=20000) {
        this.instanceId = instanceId + '';
        this.instanceDir = path.join(config.instanceDir, this.instanceId);
        this.browser = null;
        this.debugPort = portStart;
        this.browserProcess = null;
        logger.info(`Start Browser Process, port is : ${this.debugPort}`);
    }

    async start() {
        // 初始化文件夹
        // if (!await fsExtra.exists(this.instanceDir)) {
        //     logger.info(`浏览器数据目录: ${this.instanceDir} 不存在，开始复制 ${config.baseProfileDir}`);
        //     await fsExtra.copy(config.baseProfileDir, this.instanceDir);
        // }
        // 启动浏览器
        let command = `${config.chromeExecutePath} --user-data-dir=${this.instanceDir} --remote-debugging-port=${this.debugPort}`
        logger.info(`Run Command: ${command} and wait 2s`);
        this.browserProcess = exec(command);
        await wait(1000 * 2);

        return await this.connect();
    }

    async connect() {
        logger.info(`connect: ${this.debugPort}`);
        const browserPort = this.debugPort;
        this.browser = await new Promise((resolve) => {
            let t1 = setInterval(async () => {
                try {
                    let browser = await puppeteer.connect({
                        browserURL: `http://127.0.0.1:${browserPort}`,
                    })
                    clearInterval(t1);
                    clearTimeout(t2)
                    resolve(browser);
                } catch(e) {
                    logger.warn(`connect ${browserPort} failed, retry 1s`);
                }
            }, 1000)
            let t2 = setTimeout(async () => {
                logger.error('15秒连接浏览器端口失败');
                clearInterval(t1);
                clearTimeout(t2);
                resolve(null);
            }, 1000 * 15)
        })
        return this.browser;
    }
    async destroy() {
        await this.browser.close();
        await this.browserProcess.kill();
    }
}

module.exports = {
    BrowserOperator
}
