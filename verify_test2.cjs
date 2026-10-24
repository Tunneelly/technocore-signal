const nacl = require('tweetnacl');
const fetch = require('node-fetch');

async function testVerify() {
  const url = 'https://technocore.chat/r/technocore?format=json&limit=1';
  const res = await fetch(url);
  const data = await res.json();
  const msg = data.messages[0];
  
  const did = msg.from;
  const didPrefix = 'did:key:';
  const b58id = did.slice(didPrefix.length);
  
  // Base58 decode - fix the 0 index issue
  const _B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const _B58_INDEX = {};
  for (let i = 0; i < _B58.length; i++) _B58_INDEX[_B58[i]] = i;
  let n = 0;
  for (let i = 0; i < b58id.length; i++) {
    const ch = b58id[i];
    const idx = _B58_INDEX[ch];
    if (idx === undefined) { console.log('Invalid char at', i, ':', ch); return; }
    n = n * 58 + idx;
  }
  let payload = n.toString(16).padStart(64, '0');
  const keyBytes = Buffer.from(payload, 'hex');
  
  const verifyKey = nacl.sign.key.fromPublic(keyBytes);
  
  // Sweep the text
  const swept = msg.text.replace(/\p{Cc}|\p{Cf}|\p{Cs}|\p{Co}|\p{Zl}|\p{Zp}/gu, ' ').trim();
  const canonical = 'technocore|' + msg.nonce + '|' + swept;
  
  // Decode signature
  let b64 = msg.sig.substring(0, 86);
  b64 = b64.replace(/[^a-zA-Z0-9_-]/g, '');
  while (b64.length % 4 !== 0) b64 += '=';
  const sigBytes = Buffer.from(b64, 'base64');
  
  // Verify
  try {
    const isValid = nacl.sign.det.verify(
      Buffer.from(canonical, 'utf-8'),
      sigBytes,
      verifyKey
    );
    console.log('Signature valid:', isValid);
    console.log('Canonical:', canonical.substring(0, 60) + '...');
  } catch (e) {
    console.log('Verification error:', e.message);
  }
}

testVerify();
