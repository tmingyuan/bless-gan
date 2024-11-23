const { getCollection } = require('./util/dbUtil');
const { getLogger } = require('./util/log');
const { wait } = require('./util/util')
const { BrowserOperator } = require('./browser/browser');
const { getElementByText, waitElementByText, getPageByUrlPrefix } = require('./browser/page_ib');
const { getEmailCode } = require('./page_operator');
const { createNode } = require('./node_operator');

const logger = getLogger('index');



async function runInstance(accountInfo) {
  const extensionId = `group-${accountInfo.group}-${accountInfo.index}`;
  const browserOperator = new BrowserOperator(extensionId, accountInfo.index + 20000);
  const browser = await browserOperator.start();

  // await installExtension(browser);
  // return
  let returnData = {}
  try {
    returnData['auth_token'] = await runLogin(browser, accountInfo);
  } catch(e) {
    logger.error(`${accountInfo.index} login error: ${e}`);
    return
  }

  try {
    let toke = 'Bearer ' + returnData['auth_token'];
    let node_infos = await createNode(toke, accountInfo.ip || '82.152.142.196');
    // let node_infos = await extensionLogin(browser, accountInfo)
    returnData = {...returnData, node_infos: node_infos};
  } catch(e) {
    logger.error(`${accountInfo.index} extension login error: ${e}`);
    return
  }

  await browserOperator.destroy();

  return returnData;
}





async function test() {
  const accountCollection = getCollection('account');
  let accountList = await accountCollection.find({});
  console.log(accountList)
  for(let i = 0; i < accountList.length; i++) {
    // const account = await accountCollection.findOne({index: i});
    const account = accountList[i];
    try {
      const nodeInfo = await runInstance(account);
      logger.info(`${account.index} 读取到节点信息: ${JSON.stringify(nodeInfo)}`);
      if (nodeInfo !== null) {
        await accountCollection.updateAsync({_id: account._id}, {$set: nodeInfo});
      }
    } catch(e) {
      logger.error(`Register Node Exception: ${e}`);
    }
  }
  // const account = await accountCollection.findOneAsync({index: 4});
  // const nodeInfo = await runInstance(account);


  // const account = await accountCollection.findOneAsync({index: 5});
  // console.log(account)
}

test()
// startBase()

