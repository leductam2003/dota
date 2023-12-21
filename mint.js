const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const fs = require('fs')
const mnemonic = fs.readFileSync('mnemonic.txt', 'utf-8')
const count = 100

async function executeCalls() {
    const provider = new WsProvider('wss://rpc.ibp.network/polkadot');
    const api = await ApiPromise.create({ provider });
    try {
        const transferCall = api.tx.balances.transferKeepAlive(
            '138NPzWBLDjTszfyvzu9nbcHnvMTgv7Zte4hYVNb3rKQhdyd',
            0
        );
        const remarkCall = api.tx.system.remark('{"p":"dot-20","op":"mint","tick":"DOTA"}');
        const keyring = new Keyring({ type: 'sr25519' });
        const signer = keyring.addFromUri(mnemonic);
        const sender = signer.address
        for (let i = 0; i < count; i++) {
            const nonce = await api.rpc.system.accountNextIndex(sender);
            const result = await api.tx.utility
                .batchAll([transferCall, remarkCall])
                .signAndSend(signer, { nonce: nonce });

            console.log(`[${i + 1}/${count}] | Transaction hash:`, result.toHex());
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await api.disconnect();
    }
}

executeCalls();
