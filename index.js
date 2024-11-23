const fs = require('fs').promises;
const { getCollection } = require('./src/util/dbUtil');
const { getLogger } = require('./src/util/log');
const { writeCsvFile } = require('./src/util/util');

const { getTokenAndNodeInfo } = require('./src/page_operator'); // 登录


const logger = getLogger('default');


// 1. 根据 email.txt 和 ip.txt 生成账户信息,存储到数据库
async function generateAccount(){
  const emailFilePath = './data/email.txt';
  const ipiFilePath = './data/ip.txt';
  let emailList = await fs.readFile(emailFilePath);
  emailList = emailList.toString().split('\n').filter(l => l !== '');
  let ipList = await fs.readFile(ipiFilePath);
  ipList = ipList.toString().split('\n').filter(l => l !== '');
  if (ipList.length !== emailList.length) {
    logger.error('邮箱数量和IP数量不一致,脚本不支持分配');
    return
  }
  let accountList = [];
  for(let i = 0; i < emailList.length; i++) {
    let email = emailList[i].trim();
    let ip = ipList[i].trim();
    let account = {
      ip,
      email,
      index: i,
      group: 'chaomo',
    }
    console.log(`account: ${JSON.stringify(account)}`);
    accountList.push(account);
  }
  // 基于文件的数据库， 存储在database文件夹
  const accountCollection = getCollection('account');
  await accountCollection.insertAsync(accountList);
}


// 2 执行登录和节点注册，提取账号信息
async function runAccount(){
  const accountCollection = getCollection('account');
  const accountList = await accountCollection.find({});
  const accountNum = accountList.length;
  for(let i = 0; i < accountNum; i++) {
    const account = await accountCollection.findOne({index: i});
    try {
      const tokenAndrNodeInfo = await getTokenAndNodeInfo(account);
      await accountCollection.updateAsync({_id: account._id}, {$set: tokenAndrNodeInfo});
    } catch(e) {
      logger.error(`${account.index}-${account.email} Has Exception: ${e}`)
    }
  }
}


// 3  导出账号信息
async function exportAccount() {
  const accountCollection = getCollection('account');
  let accountList = await accountCollection.find({});
  logger.info(`read Account Info: ${accountList.length}`);
  accountList = accountList.map((account) => {
    let nodeInfo = account.nodeInfo || {};
    return {
      index: account.index,
      email: account.email,
      ip: account.ip,
      auth_token: account.authToken,
      node_id: account.node_id,
      userId: nodeInfo.userId,
      pubKey: nodeInfo.pubKey,
      createdAt: nodeInfo.createdAt,
      hardwareId: nodeInfo.hardwareId,
    }
  })
  let outputFilePath = './data/account.csv';
  await writeCsvFile(outputFilePath, accountList)
}


(async () => {
  // 开发版本，需要有编程基础的人根据情况进行操作
  await generateAccount()
  await runAccount()
  await exportAccount()
})();