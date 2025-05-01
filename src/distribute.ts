import 'dotenv/config'
import { createThirdwebClient, getContract, prepareContractCall, sendTransaction } from 'thirdweb'
import { privateKeyToAccount } from "thirdweb/wallets";
import { defineChain } from "thirdweb/chains";
import fs from 'fs';


// base or arbitrum
const whichChain: any = 'polygon'

// Arbitrum
const arbitrumAirdropContract = '0x2d7f582a5CD77488DA4C26a1B847B52D209b48ef';
const arbitrumDexKit = '0x9134283aFaF6E1B45689EC0b0c82fF2B232BCb30';

// Base
const baseAirdropContract = '0xEb3546d95306B0deaF329E8363279b47E04785Ac';
const baseDexKit = '0x946f8b0ef009f3f5b1b35e6511a82a58b09d8d4e';

// Base
const polygonAirdropContract = '0x8F17ca065F2975cF7CEE58634b648DF0952E24b8';
const polygonDexKit = '0x4d0def42cf57d6f27cd4983042a55dce1c9f853c';

let tokenAddress = arbitrumDexKit;;
let airdropAddress = arbitrumAirdropContract;;
let chainId = 42161;


if (whichChain === 'arbitrum') {
    tokenAddress = arbitrumDexKit;
    airdropAddress = arbitrumAirdropContract;
    chainId = 42161;
}
if (whichChain === 'base') {
    tokenAddress = baseDexKit;
    airdropAddress = baseAirdropContract;
    chainId = 8453;
}

if (whichChain === 'polygon') {
    tokenAddress = polygonDexKit;
    airdropAddress = polygonAirdropContract;
    chainId = 137;
}


const client = createThirdwebClient({
    // use clientId for client side usage
    clientId: process.env.THIRDWEB_CLIENT_ID,
    // use secretKey for server side usage
    // secretKey: "Ni2...jA4A", 
});

const wallet = privateKeyToAccount({
    client,
    privateKey: process.env.PRIVATE_KEY,
});

// 1. Create airdrop contract instance
const contract = getContract({
    address: airdropAddress,
    chain: defineChain(chainId),
    client: client
    // 1a. Insert a single client

})

const tokenContract = getContract({
    client,
    chain: defineChain(chainId),
    address: tokenAddress,
});



const tokenOwner = process.env.AIRDROP_WALLET

async function main() {
    let transaction;
    const holders: { recipient: string, amount: bigint }[] = JSON.parse(fs.readFileSync('holders.json', 'utf8')).map(h => {
        return {
            recipient: h.owner_address,
            // use later airdrop
            amount: BigInt(h.airdrop)
        }
    });
    const totalHolders = holders.length;
    const totalPerTransaction = 100;
    let i = 1;
    let holdersSended = 1;

    const airdrop_amounts = holders.map(h => h.amount);
    const totalAirdrop = airdrop_amounts.reduce((p, r) => p + r);

    console.log(totalAirdrop.toString())

    let holders_on_aidrop = [];

    while (holdersSended > 0) {

        try {
            transaction = await prepareContractCall({
                contract: tokenContract,
                //@ts-ignore
                method: "function approve(address spender, uint256 amount) returns (bool)",
                params: [airdropAddress, totalAirdrop],
            });

            const { transactionHash } = await sendTransaction({
                transaction,
                account: wallet,
            });


            const contents = holders.slice((i - 1) * totalPerTransaction, i * totalPerTransaction);

            transaction = await prepareContractCall({
                contract,
                //@ts-ignore
                method: "function airdropERC20(address _tokenAddress, address _tokenOwner, (address recipient, uint256 amount)[] _contents) payable",
                params: [tokenAddress, tokenOwner, contents],
            });
            const { transactionHash: airdropHash } = await sendTransaction({
                transaction,
                account: wallet,
            });



            holders_on_aidrop = holders_on_aidrop.concat(contents.map(h => {
                return {
                    recipient: h.recipient,
                    amount: h.amount.toString()
                }
            }))

            console.log(airdropHash);

            i++;

            console.log(totalHolders - i * 100)

            holdersSended = totalHolders - i * 100

            console.log(holdersSended)


        } catch (e) {
            console.log(e)
        }
    }




    fs.writeFile(`holders_on_airdrop_${whichChain}.json`, JSON.stringify(holders_on_aidrop), function (err) {
        if (err) throw err;
        console.log('complete');
    }
    );

}


main()

