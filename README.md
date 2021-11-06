# scripts

# rewardPayout
Sends fix amount of tokens to the list of addresses defined in the destination.json file.
If used on the local network, script will send 1 token from Alice to Bob and to Dave.

0. install:
```
git clone git@github.com:Maar-io/scripts.git
cd scripts/rewardPayout
yarn install
```

1. define list of destinations in destination.json in following format:
```
[
    "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
    "5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy"
]
```

2. Change network address for the wsProvider.
```
const wsProvider = new WsProvider('ws://localhost:9944');

```

3. Set amount for the reward. Amount is with 18 decimals. For 1 token use 1000 mTokens.
```
const REWARD_mSDN = 1000; // 1000 mSDN = 1 SDN
```


4. Run this script with
```
node --experimental-json-modules rewardPayout.js
```