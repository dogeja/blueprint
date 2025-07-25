const webpush = require("web-push");

// VAPID 키 생성
const vapidKeys = webpush.generateVAPIDKeys();

console.log("VAPID Keys generated successfully!");
console.log("");
console.log("Public Key (NEXT_PUBLIC_VAPID_PUBLIC_KEY):");
console.log(vapidKeys.publicKey);
console.log("");
console.log("Private Key (VAPID_PRIVATE_KEY):");
console.log(vapidKeys.privateKey);
console.log("");
console.log("Add these to your .env.local file:");
console.log("NEXT_PUBLIC_VAPID_PUBLIC_KEY=" + vapidKeys.publicKey);
console.log("VAPID_PRIVATE_KEY=" + vapidKeys.privateKey);
