import 'dotenv/config'
import fs from 'fs';

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


async function main() {
    // fetch holders from eth, bsc and polygon
    const response_eth = await fetch(
        "https://deep-index.moralis.io/api/v2.2/erc20/0x7866E48C74CbFB8183cd1a929cd9b95a7a5CB4F4/owners?chain=eth&order=DESC",
        options
    )
    //@ts-ignore
    const response_eth_json = (await response_eth.json() as MoralisHolderResponseInterface)//.result.filter(res => res.is_contract === false)
    let response_eth_json_filtered = (response_eth_json.result).filter(res => res.is_contract === false).map(res => { return { balance: res.balance, balance_formatted: res.balance_formatted, owner_address: res.owner_address } }) as MoralisFinalHolderArrayInterface;
    let cursor = response_eth_json.cursor;

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
            "https://deep-index.moralis.io/api/v2.2/erc20/0x314593fa9a2fa16432913dbccc96104541d32d/owners?chain=bsc&order=DESC",
            options
        )

        const response_bsc_json = (await response_bsc.json()) as MoralisHolderResponseInterface;
        console.log(response_bsc_json)

        if (!Array.isArray(response_bsc_json.result)) {
            throw new Error('API malfunction')
        }

        let response_bsc_json_filtered = (response_bsc_json.result).filter(res => res.is_contract === false).map(res => { return { balance: res.balance, balance_formatted: res.balance_formatted, owner_address: res.owner_address } }) as MoralisFinalHolderArrayInterface;
        let cursor_bsc = response_bsc_json.cursor;



        while (cursor) {
            try {
                console.log("Fetching with cursor:", cursor);
                let response_bsc_cursor = await fetch(
                    `https://deep-index.moralis.io/api/v2.2/erc20/0x314593fa9a2fa16432913dbccc96104541d32d/owners?chain=bsc&order=DESC&cursor=${cursor}`,
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
    // Fetching BSC holders
    try {

        // Fetching Polygon holders
        const response_polygon = await fetch(
            "https://deep-index.moralis.io/api/v2.2/erc20/0x4D0Def42Cf57D6f27CD4983042a55dce1C9F853c/owners?chain=polygon&order=DESC",
            options
        )
        //@ts-ignore
        const response_polygon_json = (await response_polygon.json() as MoralisHolderResponseInterface)

        if (!Array.isArray(response_polygon_json.result)) {
            throw new Error('API malfunction')
        }


        let response_polygon_json_filtered = (response_polygon_json.result).filter(res => res.is_contract === false).map(res => { return { balance: res.balance, balance_formatted: res.balance_formatted, owner_address: res.owner_address } }) as MoralisFinalHolderArrayInterface
        let cursor_polygon = response_polygon_json.cursor;

        while (cursor) {
            try {
                console.log("Fetching with cursor:", cursor);
                let response_polygon_cursor = await fetch(
                    `https://deep-index.moralis.io/api/v2.2/erc20/0x4D0Def42Cf57D6f27CD4983042a55dce1C9F853c/owners?chain=bsc&order=DESC&cursor=${cursor}`,
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
    const holders = response_eth_json_filtered as MoralisFinalHolderArrayInterface;
    // we check if holders already exist and sum
    for (let index = 0; index < response_bsc_json_filtered.length; index++) {
        const element = response_bsc_json_filtered[index];
        const isOnListIndex = holders.findIndex(h => h.owner_address === element.owner_address);
        if (isOnListIndex !== -1) {
            holders[isOnListIndex].balance_formatted = holders[isOnListIndex].balance_formatted + element.balance_formatted;

        } else {
            holders.push(element)
        }
    }

    for (let index = 0; index < response_polygon_json_filtered.length; index++) {
        const element = response_polygon_json_filtered[index];
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