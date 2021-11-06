import { ApiPromise, WsProvider } from '@polkadot/api';
import { Keyring } from '@polkadot/api';
import BN from 'bn.js';

const wsProvider = new WsProvider('ws://localhost:9944');
const api = await ApiPromise.create({ provider: wsProvider });

const keyring = new Keyring({ type: 'sr25519' });
const ALICE = keyring.addFromUri('//Alice');
const BOB = keyring.addFromUri('//Bob');
const DECIMALS = new BN('1000000000000000000');
const AMOUNT = 100;
const AMOUNT_BN = DECIMALS.mul(new BN(AMOUNT));

// Subscribe to balance change
const unsubAlice = await api.query.system.account.multi([ALICE.address, BOB.address], (balances) => {
    const [{ data: balance1 }, { data: balance2 }] = balances;
    console.log(`Alice = ${balance1.free.toHuman()}, Bob = ${balance2.free.toHuman()}`);
});

// Make a transfer from Alice to BOB, waiting for inclusion
const unsub = await api.tx.balances
  .transfer(BOB.address, AMOUNT_BN)
  .signAndSend(ALICE, (result) => {
    console.log(`Current status is ${result.status}`);

    if (result.status.isInBlock) {
      console.log(`Transaction included at blockHash ${result.status.asInBlock}`);
    } else if (result.status.isFinalized) {
      console.log(`Transaction finalized at blockHash ${result.status.asFinalized}`);
      unsub();
    }
  });