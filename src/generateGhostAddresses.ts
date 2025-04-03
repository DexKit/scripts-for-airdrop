import bitcore from 'ghost-bitcore-lib'
import fs from 'fs'

const holders = [];

[1, 2, 3, 4, 5, 6, 7, 8, 9, 19].forEach(element => {

    const privateKey = new bitcore.PrivateKey();

    const address = privateKey.toAddress();

    holders.push({
        privateKey: privateKey.toString(),
        address: address.toString(),
        amount: Math.random() * 50000
    })
});

console.log(holders)


fs.writeFile("ghostx_mock_addresses.json", JSON.stringify(holders), function (err) {
    if (err) throw err;
    console.log('complete');
}
);
