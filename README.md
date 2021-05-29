# esnext-cctalk
A Collection of Methods to Work with Serial Devices that do use the CCTalk Protocol like the EMP800 and Taiko Pub 7

keywords: CCTalk, Taiko, Pub7, EMP800, serialport, Web Serial Api, Billyone, Nv9, nv10, Alberici, comestero

## Supported Devices
- Coin Acceptors
  - WHM: EMP800
  - Alberici: AL55
  - Comestero: RM5
- Bill Reader Banknote Reader 
  - Taiko: Pub 7
  - BillyOne, 
  - Nv9
  - Nv10
- Stacker exchange and other support units
  - Comming soon.


## Funding
This is a private Project that i do love to maintain as I use it in many of my own Projects and i try to backport all my Production knowleg to this project for free.
So i add new devices as i start using them and correct failures as soon as i spot them. If you also depend on this it would be nice to become a Sponsor then i could dedicate more time into this project.

## Notes
Every where Uint8Array() // Turns Integers into the int8 encoded formart.
In Some Years when the support is better we should switch to Uint8ClampedArray which restricts to numbers from 0=>255

## Understanding bytes and bitshifts in ECMAScript
a bit shift is equal to multiplying by 2^(# of bits+1), so instead of shifting the bits ```val = val << 8```,  just do ```val = val * 256 ```.

in CCTalk we work with 0x10 === 256 === val << 8. As the Protocol works with Integers 0 till 255 Unsigned bytes. And JS Works with int16 0x100 int8 is 0x10
