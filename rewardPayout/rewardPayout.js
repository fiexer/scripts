import { ApiPromise, WsProvider } from '@polkadot/api';
import { Keyring } from '@polkadot/api';
// import { checkAddress } from '@polkadot/util-crypto';
import BN from 'bn.js';

import destination from './destination.json';

// change following lines if you want to use it on different .
const wsProvider = new WsProvider('ws://localhost:9944');
const api = await ApiPromise.create({ provider: wsProvider });

const keyring = new Keyring({ type: 'sr25519' });
const mSDN = new BN('1000000000000000');

// ************************************************************
// const MAARTEN = keyring.addFromUri('astar, polkadot, best, parachain');
// const REWARD_mSDN = 1000; // 1000 mSDN = 1 SDN
// change following 2 lines.
//      - Add mnemonics for the address which sends rewards
//      - change reward amount
const MAARTEN = keyring.addFromUri('//Alice');
const REWARD_mSDN = 1000; // 1000 mSDN = 1 SDN
// ************************************************************


const sendAmountBN = (new BN(REWARD_mSDN)).mul(mSDN);


// Subscribe to balance change
const unsubBalances = await api.query.system.account.multi([MAARTEN.address, destination[0], destination[1]], (balances) => {
  const [{ data: balance1 }, { data: balance2 }, { data: balance3 }] = balances;
  console.log(`Maarten = ${balance1.free.toHuman()}, acc1 = ${balance2.free.toHuman()}, acc2 = ${balance3.free.toHuman()}`);
});

console.log("destination", destination)


const txVec = destination.map((dest) => {
  return api.tx.balances.transfer(dest, sendAmountBN);
});

try {
  const unsub = await api.tx.utility.batch(txVec).signAndSend(MAARTEN, (result) => {
    console.log(`Current status is ${result.status}`);

    if (result.status.isInBlock) {
      console.log(`Transaction included at blockHash ${result.status.asInBlock}`);
    } else if (result.status.isFinalized) {
      console.log(`Transaction finalized at blockHash ${result.status.asFinalized}`);
      unsub();
    }
  }
  );
} catch (err) { console.error }