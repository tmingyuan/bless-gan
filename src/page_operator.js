const { getLogger } = require('./util/log');
const { wait } = require('./util/util')
const { BrowserOperator } = require('./browser/browser');
const { getElementByText, waitElementByText, getPageByUrlPrefix } = require('./browser/page_ib');
const { getCodeByEmail } = require('./email_operator');
const { createNode } = require('./node_operator');

const logger = getLogger('default');



// 登录 bless
async function loginWeb(browser, accountInfo) {
  const page = await browser.newPage();
  const dashboardLoginUrl = 'https://bless.network/dashboard';
  await page.goto(dashboardLoginUrl, {
    wait: 'networkidle2',
  });

  // 等待 email 输入框
  try {
    await page.waitForSelector('input#email');
  } catch(e) {
    logger.info(`${accountInfo.index}-${accountInfo.email} had login`);
    let auth_token = await page.evaluate(() => {return localStorage.getItem('B7S_AUTH_TOKEN')});
    logger.info(`${accountInfo.index} read auth_token=${auth_token}`)
    return auth_token;
  }

  // 输入邮箱地址
  let emailInput = await page.$('input#email');
  logger.info(`input email address: ${accountInfo.email}`);
  await emailInput.type(accountInfo.email)

  // 点击登录按钮
  await waitElementByText(page, 'button', 'Login with Email');
  logger.info(`click Login with Email button`);
  let loginButton = await getElementByText(page, 'button', 'Login with Email');
  if (loginButton === null) {
    logger.error(`Login with Email button not found`);
    return
  }
  await loginButton.click();

  // 获取 Email 验证码
  let emailCode = await getCodeByEmail(accountInfo.email);
  logger.info(`read email code: ${emailCode}`);

  // 输入验证码
  let urlPrefix = 'https://passwordless.web3auth.io/v6/authorize';
  let loginPage = await getPageByUrlPrefix(browser, urlPrefix, 10);
  if (loginPage !== null) {
    await waitElementByText(loginPage, 'p', accountInfo.email);
    let codeInputs = await loginPage.$$('input');
    await codeInputs[0].type(emailCode);
    await new Promise(async (resolve) => {
      for(let i = 0; i < 10; i++) {
        if (loginPage.isClosed()) {
          resolve()
          return
        }
        await wait(1000 * 2)
      }
      resolve()
    })
  }
  // 等 dashboard 页面完成跳转
  let dashboardUrl = 'https://bless.network/dashboard';
  for(let i = 0; i < 10; i++){
    let pages = await browser.pages();
    for(let page of pages) {
      if (page.url().startsWith(dashboardUrl)) {
        await waitElementByText(page, 'h3', 'Active Node');
        let auth_token = await page.evaluate(() => {return localStorage.getItem('B7S_AUTH_TOKEN')});
        logger.info(`get auth_token = ${auth_token}`);
        return auth_token;
      }
    }
    await wait(1000);
  }
  logger.error(`${accountInfo.index}-${accountInfo.email}  not found auth_token`);
  return null;
}


async function getTokenAndNodeInfo(accountInfo){
  const browserId = `group-${accountInfo.group}-${accountInfo.index}`;
  const browserOperator = new BrowserOperator(browserId, accountInfo.index + 60000);
  const browser = await browserOperator.start();
  let authToken = null;
  try {
    authToken = await loginWeb(browser, accountInfo);
  } catch(e){
    logger.error(`${accountInfo.index} - ${accountInfo.email} login error: ${e}`);
    await browserOperator.destroy();
    return {
      status: 'login_error'
    }
  }
  await browserOperator.destroy();

  let nodeInfo = {};
  try {
    let token = 'Bearer ' + authToken;
    nodeInfo = await createNode(token, accountInfo.ip || '82.152.142.196');
  } catch(e) {
    logger.error(`${accountInfo.index}-${accountInfo.email} create node error: ${e}`);
    return {
      authToken,
      status: 'create_node_error'
    }
  }

  return {
    authToken,
    nodeInfo,
  }
}

module.exports = {
  loginWeb,
  getTokenAndNodeInfo,
}