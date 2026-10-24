const did = 'did:key:z6Mkw9m8QztamiFiJ21Vbt5dNuZSqHcVcdHhtLGFKZj71aNc';
const didPrefix = 'did:key:';
console.log('DID starts with prefix:', did.startsWith(didPrefix));
const b58id = did.slice(didPrefix.length);
console.log('b58id length:', b58id.length);
console.log('b58id starts with z6M:', b58id.startsWith('z6M'));

// Base58 decode test
const _B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const _B58_INDEX = {};
for (let i = 0; i < _B58.length; i++) _B58_INDEX[_B58[i]] = i;
let n = 0;
for (let i = 0; i < b58id.length; i++) {
  const ch = b58id[i];
  if (!_B58_INDEX[ch]) { console.log('Invalid char:', ch); break; }
  n = n * 58 + _B58_INDEX[ch];
}
console.log('Decoded number n:', n);
// Convert to hex
let payload = n.toString(16).padStart(64, '0');
console.log('Hex payload length:', payload.length);
const keyBytes = Buffer.from(payload, 'hex');
console.log('Key bytes length:', keyBytes.length);
