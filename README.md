# scripts-for-airdrop

These are scripts used by DexKit to do airdrops. We use Moralis to fetch holders and will use web3 library to distribute.

# Links that help

https://developers.moralis.com/how-to-get-all-owners-of-an-erc20-token/

# Monthly distribution

- Update month and KIT to airdrop value on monthlyAirdropCalculator.ts

Calculate monthly airdrop distribution using: 


```
yarn fetch-monthly-holders
```

- Update month before

Distribute airdrop running 

```
yarn distribute-airdrop-monthly
```