import { ApiPromise, WsProvider } from '@polkadot/api';
import _ from '@astar-network/types';
import { Keyring } from '@polkadot/api';
const {shidenDefinitions} = _;
const wsProvider = new WsProvider('ws://localhost:9944');

// const api = await ApiPromise.create({ provider: wsProvider });
const api = await ApiPromise.create({
  provider: new WsProvider('ws://localhost:9944'),
  types: {
      ...shidenDefinitions,
  }
});

const keyring = new Keyring({ type: 'sr25519' });
const ALICE = keyring.addFromUri('//Alice');
const BOB = keyring.addFromUri('//Bob');

// Retrieve the account balance
const { data: aliceBalance } = await api.query.system.account(ALICE.address);
console.log("Alice's initial balance", aliceBalance.free.toHuman());
const { data: bobBalance } = await api.query.system.account(BOB.address);
console.log("Bob's initial balance", bobBalance.free.toHuman());

// Subscribe to balance change
const unsubAlice = await api.query.system.account.multi([ALICE.address, BOB.address], (balances) => {
    const [{ data: balance1 }, { data: balance2 }] = balances;

    console.log(`Alice = ${balance1.free.toHuman()}, Bob = ${balance2.free.toHuman()}`);
});

// Make a transfer from Alice to BOB, waiting for inclusion
const unsub = await api.tx.balances
  .transfer(BOB, 100)
  .signAndSend(ALICE, (result) => {
    console.log(`Current status is ${result.status}`);

    if (result.status.isInBlock) {
      console.log(`Transaction included at blockHash ${result.status.asInBlock}`);
    } else if (result.status.isFinalized) {
      console.log(`Transaction finalized at blockHash ${result.status.asFinalized}`);
      unsub();
    }
  });