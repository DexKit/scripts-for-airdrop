// analyse holders data
import fs from 'fs';


interface MoralisFinalHolder {
    owner_address: string,
    balance: string,
    balance_formatted: string,
    airdrop: string,
    airdrop_formatted: string
};

interface MoralisFinalHolderArrayInterface extends Array<MoralisFinalHolder> { }

const holders = JSON.parse(fs.readFileSync('mapped_holders.json', 'utf8')) as MoralisFinalHolderArrayInterface

console.log('Total holders:', holders.length);
// Total airdrop
/*const airdrop_array = holders.map(h => Number(h.airdrop_formatted));


const total_airdrop = airdrop_array.reduce((p, r) => Number(p) + Number(r))

console.log("Total airdrop: ", total_airdrop)*/

const total_array = holders.map(h => Number(h.balance_formatted));


const total_kit = total_array.reduce((p, r) => Number(p) + Number(r))

console.log("Total airdrop: ", total_kit)