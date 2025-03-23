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

const holders = JSON.parse(fs.readFileSync('holders.json', 'utf8')) as MoralisFinalHolderArrayInterface

console.log('Total holders:', holders.length);

const airdrop_array = holders.map(h => h.airdrop_formatted);

// Total airdrop
const total_airdrop = airdrop_array.reduce((p, r) => String(Number(p) + Number(r)))

console.log("Total airdrop: ", total_airdrop)