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


async function main() {
    let cursor
    // fetch holders from eth, bsc and polygon
    const response_eth = await fetch(
        `https://deep-index.moralis.io/api/v2.2/erc20/${DEXKIT_ETHEREUM}/owners?chain=eth&order=DESC`,
        options
    )


    //@ts-ignore
    const response_eth_json = (await response_eth.json() as MoralisHolderResponseInterface)//.result.filter(res => res.is_contract === false)
    let response_eth_json_filtered = (response_eth_json.result).filter(res => res.is_contract === false).map(res => { return { balance: res.balance, balance_formatted: res.balance_formatted, owner_address: res.owner_address } }) as MoralisFinalHolderArrayInterface;
    cursor = response_eth_json.cursor;

    while (cursor) {
        try {
            console.log("Fetching with cursor:", cursor);
            let response_eth_cursor = await fetch(
                `https://deep-index.moralis.io/api/v2.2/erc20/0x7866E48C74CbFB8183cd1a929cd9b95a7a5CB4F4/owners?chain=eth&order=DESC&cursor=${cursor}`,
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

    // Fetching BSC holders
    let response_bsc_json_filtered = []
    try {

        const response_bsc = await fetch(
            `https://deep-index.moralis.io/api/v2.2/erc20/${DEXKIT_BSC}/owners?chain=bsc&order=DESC`,
            options
        )

        const response_bsc_json = (await response_bsc.json()) as MoralisHolderResponseInterface;

        if (!Array.isArray(response_bsc_json.result)) {
            throw new Error('API malfunction')
        }

        response_bsc_json_filtered = (response_bsc_json.result).filter(res => res.is_contract === false).map(res => { return { balance: res.balance, balance_formatted: res.balance_formatted, owner_address: res.owner_address } }) as MoralisFinalHolderArrayInterface;
        let cursor_bsc = response_bsc_json.cursor;

        while (cursor_bsc) {
            try {
                console.log("Fetching with cursor:", cursor_bsc);
                let response_bsc_cursor = await fetch(
                    `https://deep-index.moralis.io/api/v2.2/erc20/${DEXKIT_BSC}/owners?chain=bsc&order=DESC&cursor=${cursor_bsc}`,
                    options
                );

                const response_bsc_json_cursor = await response_bsc_cursor.json() as MoralisHolderResponseInterface;
                cursor_bsc = response_bsc_json_cursor.cursor;  // Update cursor from response

                const filtered_results = response_bsc_json_cursor.result.filter((res: any) => res.is_contract === false).map(res => { return { balance: res.balance, balance_formatted: res.balance_formatted, owner_address: res.owner_address } }) as MoralisFinalHolderArrayInterface;
                response_bsc_json_filtered = response_bsc_json_filtered.concat(filtered_results);
                // If no cursor returned, we've reached the end
                if (!cursor) {
                    console.log("No more pages to fetch");
                    break;
                }
            } catch (e) {
                console.error("Error fetching data:", e);
                break;  // Break the loop if there's an error
            }
        }
    } catch (e) {
        console.error("Error fetching data:", e);
    }


    let response_polygon_json_filtered = []
    // Fetching Polygon holders
    try {

        // Fetching Polygon holders
        const response_polygon = await fetch(
            `https://deep-index.moralis.io/api/v2.2/erc20/${DEXKIT_POLYGON}/owners?chain=polygon&order=DESC`,
            options
        )
        //@ts-ignore
        const response_polygon_json = (await response_polygon.json() as MoralisHolderResponseInterface)

        if (!Array.isArray(response_polygon_json.result)) {
            throw new Error('API malfunction')
        }


        response_polygon_json_filtered = (response_polygon_json.result).filter(res => res.is_contract === false).map(res => { return { balance: res.balance, balance_formatted: res.balance_formatted, owner_address: res.owner_address } }) as MoralisFinalHolderArrayInterface
        let cursor_polygon = response_polygon_json.cursor;

        while (cursor_polygon) {
            try {
                console.log("Fetching with cursor:", cursor_polygon);
                let response_polygon_cursor = await fetch(
                    `https://deep-index.moralis.io/api/v2.2/erc20/${DEXKIT_POLYGON}/owners?chain=polygon&order=DESC&cursor=${cursor_polygon}`,
                    options
                );

                const response_polygon_json_cursor = await response_polygon_cursor.json() as MoralisHolderResponseInterface;
                cursor_polygon = response_polygon_json_cursor.cursor;  // Update cursor from response

                const filtered_results = response_polygon_json_cursor.result.filter((res: any) => res.is_contract === false).map(res => { return { balance: res.balance, balance_formatted: res.balance_formatted, owner_address: res.owner_address } }) as MoralisFinalHolderArrayInterface;
                response_polygon_json_filtered = response_polygon_json_filtered.concat(filtered_results);

                // If no cursor returned, we've reached the end
                if (!cursor) {
                    console.log("No more pages to fetch");
                    break;
                }
            } catch (e) {
                console.error("Error fetching data:", e);
                break;  // Break the loop if there's an error
            }
        }

    } catch (e) {
        console.error("Error fetching data:", e);
    }

    // Consolidating all holders in one place
    const holders: MoralisFinalHolderArrayInterface = response_eth_json_filtered as MoralisFinalHolderArrayInterface;
    // we check if holders already exist and sum
    for (let index = 0; index < response_bsc_json_filtered.length; index++) {
        const element = response_bsc_json_filtered[index];
        const isOnListIndex = holders.findIndex(h => h.owner_address.toLowerCase() === element.owner_address.toLowerCase());
        if (isOnListIndex !== -1) {
            holders[isOnListIndex].balance_formatted = (Number(holders[isOnListIndex].balance_formatted) + Number(element.balance_formatted)).toString();
            holders[isOnListIndex].balance = (BigInt(holders[isOnListIndex].balance) + BigInt(element.balance)).toString();

        } else {
            holders.push(element)
        }
    }

    for (let index = 0; index < response_polygon_json_filtered.length; index++) {
        const element = response_polygon_json_filtered[index];
        const isOnListIndex = holders.findIndex(h => h.owner_address.toLowerCase() === element.owner_address.toLowerCase());
        if (isOnListIndex !== -1) {
            console.log('repeated holder', holders[isOnListIndex].owner_address)
            holders[isOnListIndex].balance_formatted = holders[isOnListIndex].balance_formatted + element.balance_formatted;
            holders[isOnListIndex].balance = (BigInt(holders[isOnListIndex].balance) + BigInt(element.balance)).toString();

        } else {
            holders.push(element)
        }
    }

    // we want only above 5 KIT, if higher than 10k we put it as 10K

    const filtered_holders = holders.filter(h => Number(h.balance_formatted) > 5).map(h => {
        let balance_formatted = h.balance_formatted;
        let balance = h.balance;
        let airdrop_formatted;
        let airdrop
        if (Number(h.balance_formatted) > 10000) {
            balance_formatted = '10000';
            balance = parseEther('10000').toString()
        }

        airdrop_formatted = ((Number(balance_formatted) / 10000) * 500).toString()
        airdrop = parseEther(airdrop_formatted).toString();



        return {
            ...h,
            balance_formatted,
            balance,
            airdrop_formatted,
            airdrop
        }
    })

    // 10000 receives 500KIT in each network

    // Remove after first airdrop
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

    const final_holders = [...filtered_holders, ...newHolders];




    console.log('total number of holders:', final_holders.length)

    fs.writeFile("holders.json", JSON.stringify(final_holders), function (err) {
        if (err) throw err;
        console.log('complete');
    }
    );



}

main()