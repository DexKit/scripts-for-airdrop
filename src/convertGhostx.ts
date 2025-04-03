import fs from 'fs';
// example of wallet

// GNbD69tPvQgWaykyEKucqWT8zCRdpuwAmY
// Gg0jZOTynEwl5WkBFXRCcy6zNoVHWN3agK


interface Holder {
    owner_address: string,
    balance_formatted: string

}
//https://stackoverflow.com/questions/1349404/generate-a-string-of-random-characters
function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}


const members = JSON.parse(fs.readFileSync('holders_ghostx_in_eth.json', 'utf8')) as Holder[];





const ghostHolders = members.map((h) => {
    return {

        address: `G${makeid(33)}`,
        balance: h.balance_formatted
    }

})


fs.writeFile("ghostx_holders.json", JSON.stringify(ghostHolders), function (err) {
    if (err) throw err;
    console.log('complete');
}
);