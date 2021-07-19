import { CCTalkMessageCompat, object2Array } from 'esnext-cctalk/modules/payload-helpers';
console.log(CCTalkMessageCompat());
console.log(object2Array({
    src: 1,
    dest: 0,
    data: new Uint8Array([33,44,2,1,5]),
    command: 124,
    crcType: 16
}))
/*
The raw data to transmit is 40 0 1 254 217 which have the meaning :

message destination   40 = bill acceptor
data field length -zero , the message contains no data bytes
message source 1 – master
header 254 = simple pool
simple checksum  = (-40 -0 -1 -254)mod 256 = 217
*/

console.log(object2Array({
    src: 1,
    dest: 40,
    data: new Uint8Array([]),
    command: 254,
    crcType: 16
}))

console.log('##########')

console.log(object2Array({
    src: 1,
    dest: 0,
    data: new Uint8Array([]),
    command: 254,
    crcType: 8
}))


console.log(object2Array({
    src: 1,
    dest: 2,
    data: new Uint8Array([]),
    command: 254,
    crcType: 8
}))