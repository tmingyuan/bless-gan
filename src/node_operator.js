const fetch = require('node-fetch');
const crypto = require('crypto');

const { B7S } = require('./extension/background');
const { getLogger } = require("./util/log");

const logger = getLogger('default');


async function createNode(authorization, ip) {
  const {
    peerId,
    encryptedKey
  } = await createPeer();
  const hardwareId = await generateDevceIdentifier();
  const postData = await fetch(`https://gateway-run.bls.dev/api/v1/nodes/${peerId}`, {
    "headers": {
      "accept": "*/*",
      "accept-language": "zh-CN,zh;q=0.9",
      "authorization": authorization,
      "content-type": "application/json",
      "priority": "u=1, i",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "cross-site"
    },
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": JSON.stringify({
      ipAddress: ip,
      hardwareId: hardwareId,
    }),
    "method": "POST"
  });
  const nodeInfo = await postData.json();
  logger.info(`Get Node Info: ${JSON.stringify(nodeInfo)}`);
  nodeInfo.inputIpAddress = ip;
  nodeInfo.inputHardwareId = hardwareId;
  nodeInfo.inputPeerId = peerId
  nodeInfo.inputEncryptedKey = encryptedKey;
  return nodeInfo;
}

async function createPeer(){
  const r = '6b66260453d590ba82faf310';
  const {peerId, encryptedKey} = await B7S.GeneratePrivateKey(r);
  logger.info(`get PeerId=${peerId} and encryptedKey=${encryptedKey}`);
  return {
    peerId,
    encryptedKey
  }
}


async function generateDevceIdentifier() {
  const length = 20;
  const hardwareIdentifier = crypto.randomBytes(length).toString('hex');
  let n = new TextEncoder().encode(hardwareIdentifier);
  let deviceId = await crypto.subtle.digest("SHA-256", n).then(i => Array.from(new Uint8Array(i)).map(a => a.toString(16).padStart(2, "0")).join(""))
  logger.info(`get DeviceID: ${deviceId}`);
  return deviceId;
}


module.exports = {
  createPeer,
  createNode,
  generateDevceIdentifier,
}