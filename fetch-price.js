const { ChainId, Token, WETH, Fetcher, Route, Trade, TokenAmount, TradeType } = require('@uniswap/sdk')
const { getNetwork } = require('@ethersproject/networks')
const { getDefaultProvider, InfuraProvider } = require('@ethersproject/providers')
const web3 = require('web3');
const search = require('./search');

let chainId = ChainId.MAINNET
let network = getDefaultProvider(getNetwork(chainId))
const TOKENS = { //LINK ใช่ไม่ได้ , OMG ใช่ไม่ได้ , TUSD ใช่ไม่ได้
    'ETH': new Token(chainId, "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", 18),
    'MKR': new Token(chainId, '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2', 18),
   // 'DAI': new Token(chainId, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18),
    // 'UNI': new Token(chainId, "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", 18),
     //'USDT': new Token(chainId, "0xdAC17F958D2ee523a2206206994597C13D831ec7", 18),
}
//0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee = ETH
//0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2 = WETH
const getTokenData = (chainId, address) => Fetcher.fetchTokenData(chainId, address);
const getPair = (TokenA, TokenB) => Fetcher.fetchPairData(TokenA, TokenB);

const getMidPrice = async (TokenA, TokenB) => {
    const pair = await getPair(TokenA, TokenB);
    const route = new Route([pair], TokenA);
    return +route.midPrice.toSignificant(6);
}
const getExecutionPrice = async (TokenA, TokenB, amount) => {
    const pair = await getPair(TokenA, TokenB);
    const route = new Route([pair], TokenA);
    const trade = new Trade(route, new TokenAmount(WETH[DAI.chainId], amount), TradeType.EXACT_INPUT)
}
const getAllPairMidPrices = async () => {
    const tokenNames = Object.keys(TOKENS);
    const tokenArr = Object.values(TOKENS);
    const priceMatrix = [];
    for (let i = 0; i < tokenArr.length; i++) {
        if (!priceMatrix[i]) priceMatrix[i] = [];
        for (let j = 0; j < tokenArr.length; j++) {
            priceMatrix[i][j] = i === j ? 1 : await getMidPrice(tokenArr[i], tokenArr[j]); // 1 = amount
            console.log(tokenNames[i], tokenNames[j], priceMatrix[i][j]);
        }
    };
    return priceMatrix;
}

const main = async () => {
    const priceMatrix = await getAllPairMidPrices();
    const names = Object.keys(TOKENS);
    console.log("priceMatrix", priceMatrix)
    // console.log(priceMatrix)
    const bestRoute = search(priceMatrix, names);
    console.log('max', bestRoute);
}

main()