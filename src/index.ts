
import 'dotenv/config'
import fs from 'fs';

const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        'X-API-Key': process.env.MORALIS_API_KEY
    },
};


async function main() {
    // fetch holders from eth, bsc and polygon
    const response_eth = await fetch(
        "https://deep-index.moralis.io/api/v2.2/erc20/0x7866E48C74CbFB8183cd1a929cd9b95a7a5CB4F4/owners?chain=eth&order=DESC",
        options
    )
    //@ts-ignore
    const response_eth_json = (await response_eth.json() as { result: Array<{ owner_address: string, balance_formatted: string, is_contract: boolean }>, cursor: string })//.result.filter(res => res.is_contract === false)
    let response_eth_json_filtered = (response_eth_json.result as Array<{ owner_address: string, balance_formatted: string, is_contract: boolean }>).filter(res => res.is_contract === false)
    let cursor = response_eth_json.cursor;
    while (cursor) {
        cursor = ""
        try {

            console.log(cursor);
            let response_eth_cursor = await fetch(
                "https://deep-index.moralis.io/api/v2.2/erc20/0x7866E48C74CbFB8183cd1a929cd9b95a7a5CB4F4/owners?chain=eth&order=DESC&cursor=" + response_eth_json.cursor,
                options
            )
            console.log(response_eth_cursor)
            const response_eth_json_cursor = (await response_eth_cursor.json());
            cursor = (await response_eth_cursor.json()).cursor;
            response_eth_json_filtered = response_eth_json_filtered.concat(response_eth_json_cursor.result);
        } catch (e) {
            console.log(e)
        }
    }


    const response_bsc = await fetch(
        "https://deep-index.moralis.io/api/v2.2/erc20/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0/owners?chain=bsc&order=DESC",
        options
    )
    //@ts-ignore
    const response_bsc_json = (await response_bsc.json() as Array<{ owner_address: string, balance_formatted: string, is_contract: boolean }>).result.filter(res => res.is_contract === false)

    const response_polygon = await fetch(
        "https://deep-index.moralis.io/api/v2.2/erc20/0x314593fa9a2fa16432913dbccc96104541d32d11/owners?chain=polygon&order=DESC",
        options
    )
    //@ts-ignore
    const response_polygon_json = (await response_polygon.json() as Array<{ owner_address: string, balance_formatted: string, is_contract: boolean }>).result.filter(res => res.is_contract === false)

    // Consolidating all holders in one place
    const holders = response_eth_json_filtered;
    // we check if holders already exist and sum
    for (let index = 0; index < response_bsc_json.length; index++) {
        const element = response_bsc_json[index];
        const isOnListIndex = holders.findIndex(h => h.owner_address === element.owner_address);
        if (isOnListIndex !== -1) {
            holders[isOnListIndex].balance_formatted = holders[isOnListIndex].balance_formatted + element.balance_formatted;

        } else {
            holders.push(element)
        }
    }

    for (let index = 0; index < response_polygon_json.length; index++) {
        const element = response_polygon_json[index];
        const isOnListIndex = holders.findIndex(h => h.owner_address === element.owner_address);
        if (isOnListIndex !== -1) {
            holders[isOnListIndex].balance_formatted = holders[isOnListIndex].balance_formatted + element.balance_formatted;

        } else {
            holders.push(element)
        }
    }

    console.log('total number of holders:', holders.length)

    fs.writeFile("holders.json", JSON.stringify(holders), function (err) {
        if (err) throw err;
        console.log('complete');
    }
    );



}

main()