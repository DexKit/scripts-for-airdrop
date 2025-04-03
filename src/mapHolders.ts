import fs from 'fs';
import { parseEther } from 'viem'
interface MoralisFinalHolder {
    owner_address: string,
    balance: string,
    balance_formatted: string,
    airdrop: string,
    airdrop_formatted: string
};

interface MoralisFinalHolderArrayInterface extends Array<MoralisFinalHolder> { }

const holders = JSON.parse(fs.readFileSync('filtered_holders.json', 'utf8')) as MoralisFinalHolderArrayInterface

console.log(holders)

const filtered_holders = holders.filter(h => Number(h.balance_formatted) > 5).map(h => {
    let balance_formatted = h.balance_formatted;
    let balance = h.balance;
    if (Number(h.balance_formatted) > 10000) {
        balance_formatted = '10000';
        balance = parseEther('10000').toString()
    }
    console.log(h)

    return {
        ...h,
        balance_formatted,
        balance,
    }
})


console.log(filtered_holders)


fs.writeFile("mapped_holders.json", JSON.stringify(filtered_holders), function (err) {
    if (err) throw err;
    console.log('complete');
}
);