const nacl = require('tweetnacl');
const fetch = require('node-fetch');

async function testVerify() {
  // Fetch a message and try to verify
  const url = 'https://technocore.chat/r/technocore?format=json&limit=1';
  const res = await fetch(url);
  const data = await res.json();
  const msg = data.messages[0];
  
  console.log('Message seq:', msg.seq);
  console.log('Message from:', msg.from);
  console.log('Message text (first 50):', msg.text.substring(0, 50));
  console.log('Message nonce:', msg.nonce);
  console.log('Message sig (first 20):', msg.sig.substring(0, 20));
  
  // Now try to verify
  const didPrefix = 'did:key:';
  const b58id = msg.from.slice(didPrefix.length);
  console.log('b58id length:', b58id.length);
  console.log('b58id starts with z6M:', b58id.startsWith('z6M'));
  
  // Base58 decode
  const _B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const _B58_INDEX = {};
  for (let i = 0; i < _B58.length; i++) _B58_INDEX[_B58[i]] = i;
  let n = 0;
  for (let i = 0; i < b58id.length; i++) {
    const ch = b58id[i];
    if (!_B58_INDEX[ch]) { console.log('Invalid char at', i, ':', ch); break; }
    n = n * 58 + _B58_INDEX[ch];
  }
  let payload = n.toString(16).padStart(64, '0');
  const keyBytes = Buffer.from(payload, 'hex');
  
  const verifyKey = nacl.sign.key.fromPublic(keyBytes);
  
  // Build canonical string
  // Sweep the text
  const swept = msg.text.replace(/\p{Cc}|\p{Cf}|\p{Cs}|\p{Co}|\p{Zl}|\p{Zp}/gu, ' ').trim();
  const canonical = 'technocore|' + msg.nonce + '|' + swept;
  console.log('Canonical string (first 80):', canonical.substring(0, 80));
  
  // Decode signature
  let b64 = msg.sig.substring(0, 86);
  b64 = b64.replace(/[^a-zA-Z0-9_-]/g, '');
  while (b64.length % 4 !== 0) b64 += '=';
  const sigBytes = Buffer.from(b64, 'base64');
  console.log('Sig bytes length:', sigBytes.length);
  
  // Verify
  try {
    const isValid = nacl.sign.det.verify(
      Buffer.from(canonical, 'utf-8'),
      sigBytes,
      verifyKey
    );
    console.log('Signature valid:', isValid);
  } catch (e) {
    console.log('Verification error:', e.message);
  }
}

testVerify();
