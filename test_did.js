const did = 'did:key:z6Mkw9m8QztamiFiJ21Vbt5dNuZSqHcVcdHhtLGFKZj71aNc';
const prefix = 'did:key:';
const body = did.slice(prefix.length);
console.log('body length:', body.length);
console.log('body:', body);
console.log('startsWith z6M:', body.startsWith('z6M'));
