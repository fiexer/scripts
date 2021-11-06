const sendBatchTransaction = async (api: ApiPromise, transactionList: AddressList[], origin: AddressOrPair) => {
    const validAddr = _.filter(transactionList, (tx) => {
        return PolkadotCryptoUtils.checkAddress(tx.receiverAddress, 5)[0];
    });

    const txVec = _.map(validAddr, (dest) => {
        const account = dest.receiverAddress;
        const amount = new BN(dest.sendAmount.replace('0x', ''), 'hex');

        return api.tx.balances.transfer(account, amount);
    });

    //const txHash = await plasmApi.api.tx.balances.
    const hash = await api.tx.utility.batch(txVec).signAndSend(origin, { nonce: 32 });

    return hash;
};