import fs from 'fs';
import { parseEther } from 'viem'

interface MoralisFinalHolder {
    owner_address: string,
    balance: string,
    balance_formatted: string,
    airdrop: string,
    airdrop_formatted: string
};


// Let's add the community members

const members = JSON.parse(fs.readFileSync('data/all.json', 'utf8')) as string[];


let newHolders: MoralisFinalHolder[] = members.map(m => {
    return {
        owner_address: m,
        balance: parseEther('50').toString(),
        balance_formatted: '50',
        airdrop: parseEther('50').toString(),
        airdrop_formatted: '50'
    }
})


const holders = JSON.parse(fs.readFileSync('holders', 'utf8'));
//
const final_holders = [...holders, ...newHolders];

fs.writeFile("holders.json", JSON.stringify(final_holders), function (err) {
    if (err) throw err;
    console.log('complete');
}
);