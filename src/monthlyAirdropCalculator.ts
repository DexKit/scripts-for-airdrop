import 'dotenv/config'
import fs from 'fs';
import { parseEther } from 'viem'

const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        'X-API-Key': process.env.MORALIS_API_KEY
    },
};

interface MoralisHolder {
    owner_address: string,
    balance: string,
    balance_formatted: string,
    is_contract: boolean
};

interface MoralisFinalHolder {
    owner_address: string,
    balance: string,
    balance_formatted: string,
};

interface MoralisHolderArrayInterface extends Array<MoralisHolder> { }

interface MoralisFinalHolderArrayInterface extends Array<MoralisFinalHolder> { }

interface MoralisHolderResponseInterface { result: MoralisHolderArrayInterface, cursor: string };

const DEXKIT_POLYGON = '0x4d0def42cf57d6f27cd4983042a55dce1c9f853c';
const DEXKIT_ETHEREUM = '0x7866E48C74CbFB8183cd1a929cd9b95a7a5CB4F4';
const DEXKIT_BSC = '0x314593fa9a2fa16432913dbccc96104541d32d11';
const DEXKIT_ARBITRUM = '0x9134283afaf6e1b45689ec0b0c82ff2b232bcb30';
const DEXKIT_BASE = '0x946f8b0ef009f3f5b1b35e6511a82a58b09d8d4e';

const MIN_KIT = 1000;
const MAX_KIT = 10000;
const MONTH = '5';
//Each month we pick the amount in this wallet: https://polygonscan.com/token/0x4d0def42cf57d6f27cd4983042a55dce1c9f853c?a=0x65073B9BBb15Fec458eDa8c1646Fe443F606cB7b
const KIT_TO_AIRDROP = 5022;


async function fetchHolders({ chain, address }: { chain: string, address: string }) {
    let cursor
    // fetch holders from respective chain
    const response_eth = await fetch(
        `https://deep-index.moralis.io/api/v2.2/erc20/${address}/owners?chain=${chain}&order=DESC`,
        options
    )

    console.log(`fetching chain ${chain}`)

 


    //@ts-ignore
    const response_eth_json = (await response_eth.json() as MoralisHolderResponseInterface)//.result.filter(res => res.is_contract === false)

 
    let response_eth_json_filtered = (response_eth_json.result).filter(res => res.is_contract === false).map(res => { return { balance: res.balance, balance_formatted: res.balance_formatted, owner_address: res.owner_address } }) as MoralisFinalHolderArrayInterface;

    console.log(response_eth_json_filtered);
    cursor = response_eth_json.cursor;

    while (cursor) {
        try {
            console.log("Fetching with cursor:", cursor);
            let response_eth_cursor = await fetch(
                `https://deep-index.moralis.io/api/v2.2/erc20/${address}/owners?chain=${chain}&order=DESC&cursor=${cursor}`,
                options
            );

            const response_eth_json_cursor = await response_eth_cursor.json() as MoralisHolderResponseInterface;
            cursor = response_eth_json_cursor.cursor;  // Update cursor from response

            const filtered_results = response_eth_json_cursor.result.filter((res) => res.is_contract === false).map(res => { return { balance: res.balance, balance_formatted: res.balance_formatted, owner_address: res.owner_address } }) as MoralisFinalHolderArrayInterface;
            response_eth_json_filtered = response_eth_json_filtered.concat(filtered_results);

            // If no cursor returned, we've reached the end
            if (!cursor) {
                console.log("No more pages to fetch");
            }
        } catch (e) {
            console.error("Error fetching data:", e);
            break;  // Break the loop if there's an error
        }
    }

    return response_eth_json_filtered
}

function calculateHoldersList({holders, newHolders}:{holders: MoralisFinalHolderArrayInterface, newHolders: MoralisFinalHolderArrayInterface}){
    for (let index = 0; index < newHolders.length; index++) {
        const element = newHolders[index];
        const isOnListIndex = holders.findIndex(h => h.owner_address.toLowerCase() === element.owner_address.toLowerCase());
        if (isOnListIndex !== -1) {
            holders[isOnListIndex].balance_formatted = (Number(holders[isOnListIndex].balance_formatted) + Number(element.balance_formatted)).toString();
            holders[isOnListIndex].balance = (BigInt(holders[isOnListIndex].balance) + BigInt(element.balance)).toString();

        } else {
            holders.push(element)
        }
    }
    return holders
}





async function main() {

    const response_eth_json_filtered = await fetchHolders({ chain: 'eth', address: DEXKIT_ETHEREUM })

    const response_bsc_json_filtered = await fetchHolders({ chain: 'bsc', address: DEXKIT_BSC })

    const response_polygon_json_filtered = await fetchHolders({ chain: 'polygon', address: DEXKIT_POLYGON })

    const response_arbitrum_json_filtered = await fetchHolders({ chain: 'arbitrum', address: DEXKIT_ARBITRUM })

    const response_base_json_filtered = await fetchHolders({ chain: 'base', address: DEXKIT_BASE })

    // Consolidating all holders in one place
    let holders: MoralisFinalHolderArrayInterface = [];
    // we check if holders already exist and sum
  
    holders = calculateHoldersList({holders, newHolders: response_base_json_filtered })
    holders = calculateHoldersList({holders, newHolders: response_arbitrum_json_filtered })
    holders = calculateHoldersList({holders, newHolders: response_eth_json_filtered })
    holders = calculateHoldersList({holders, newHolders: response_bsc_json_filtered })
    holders = calculateHoldersList({holders, newHolders: response_polygon_json_filtered })



    

    const filtered_holders = holders.filter(h => Number(h.balance_formatted) >= MIN_KIT).map(h => {
         let balance_formatted = h.balance_formatted;
         let balance = h.balance;
         if (Number(h.balance_formatted) > MAX_KIT) {
             balance_formatted = MAX_KIT.toString();
             balance = parseEther(MAX_KIT.toString()).toString()
         }

         return {
             ...h,
             balance_formatted,
             balance,
         }
     })


     const total_holders = filtered_holders.length;

     const total_kit = filtered_holders.map(h=> Number(h.balance_formatted)).reduce((p,v)=> p+v);



     const ratio_per_kit = KIT_TO_AIRDROP/total_kit;


     const holders_with_airdrop = filtered_holders.map(h=>{
        let balance_formatted = h.balance_formatted;
        let airdrop_formatted;
        let airdrop;

        airdrop_formatted = (Number(balance_formatted)*ratio_per_kit).toString()
        airdrop = parseEther(airdrop_formatted).toString();

        return {
            ...h,
            airdrop_formatted,
            airdrop

        }

     })



    console.log('total number of holders:', total_holders);
    console.log('total KIT', total_kit)
    console.log('ratio per kit', ratio_per_kit)

    const airdrop_metadata = {
        total_holders,
        total_kit,
        ratio_per_kit
    }

    fs.writeFile(`./monthly_airdrops/holders_${MONTH}.json`, JSON.stringify(holders_with_airdrop), function (err) {
        if (err) throw err;
        console.log('complete holders');
    }
    );

    fs.writeFile(`./monthly_airdrops/metadata_${MONTH}.json`, JSON.stringify(airdrop_metadata), function (err) {
        if (err) throw err;
        console.log('complete airdrop metadata');
    }
    );



}

main()