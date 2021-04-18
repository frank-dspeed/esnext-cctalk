# esnext-cctalk
A Collection of Methods to Work with Serial Devices that do use the CCTalk Protocol like the EMP800 and Taiko Pub 7

keywords: CCTalk, Taiko, Pub7, EMP800, serialport, Web Serial Api


## Notes
Every where Uint8Array() // Turns Integers into the int8 encoded formart.
In Some Years when the support is better we should switch to Uint8ClampedArray which restricts to numbers from 0=>255

## Understanding bytes and bitshifts in ECMAScript
a bit shift is equal to multiplying by 2^(# of bits+1), so instead of shifting the bits ```val = val << 8```,  just do ```val = val * 256 ```.

in CCTalk we work with 0x10 === 256 === val << 8. As the Protocol works with Integers 0 till 255 Unsigned bytes. And JS Works with int16 0x100 int8 is 0x10