
// 封装的一些页面的操作工具

async function getElementByText(page, elementTagName, elementText) {
  // 根据文案查找元素
  const elements = await page.$$(elementTagName);
  for(let i = 0; i < elements.length; i++) {
    let element = elements[i];
    let innerText = await element.evaluate(button => button.innerText);
    innerText = innerText.trim();
    // console.log('-------->', innerText, elementText === innerText)
    if (innerText === elementText){
      return element
    }
  }
  return null;
}


async function waitElementByText(page, elementTagName, elementText, waitSeconds=10) {
  // 等待指定文案的元素出现
  console.log(`wait element by text: ${elementTagName} (text="${elementText}")`);
  return new Promise((resolve, reject) => {
    let t1 = setInterval(async () => {
      let element = await getElementByText(page, elementTagName, elementText);
      if (element === null) {
        return
      }
      clearInterval(t1);
      clearTimeout(t2);
      resolve(element);
    }, 1000);
    let t2 = setTimeout(async () => {
      if (t1){
        clearInterval(t1);
        resolve(null)
      }
    }, 1000 * waitSeconds)
  })
}

async function getPageByUrlPrefix(browser, urlPrefix, timeout=10) {
  // 根据url前缀查找页面
  return await new Promise(async (resolve) => {
    let t1 = setInterval(async () => {
      const pages = await browser.pages();
      for (let page of pages) {
        let pageUrl = page.url();
        if (pageUrl.startsWith(urlPrefix)) {
          clearInterval(t1);
          clearTimeout(t2);
          resolve(page);
        }
      }
    }, 1000);
    let t2 = setTimeout(() => {
      if (t1) {
        clearInterval(t1);
        resolve(null);
      }
    }, 1000 * timeout)
  })
}


module.exports = {
  getElementByText,
  waitElementByText,
  getPageByUrlPrefix,
}