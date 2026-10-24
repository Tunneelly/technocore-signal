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
  console.log('b58id:', b58id);
  console.log('b58id length:', b58id.length);
  
  // Base58 decode
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
  console.log('Decoded n:', n);
  let payload = n.toString(16).padStart(64, '0');
  console.log('Hex payload length:', payload.length);
  const keyBytes = Buffer.from(payload, 'hex');
  console.log('Key bytes length:', keyBytes.length);
  
  const verifyKey = nacl.sign.key.fromPublic(keyBytes);
  console.log('Verify key created');
  
  // Simple text sweep - just replace control chars
  let swept = msg.text;
  swept = swept.replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ');
  swept = swept.trim();
  console.log('Swept text:', swept.substring(0, 50));
  
  const canonical = 'technocore|' + msg.nonce + '|' + swept;
  console.log('Canonical (first 60):', canonical.substring(0, 60));
  
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
