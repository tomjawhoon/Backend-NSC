const { ChainId, Token, WETH, Fetcher, Route, Trade, TokenAmount, TradeType } = require('@uniswap/sdk')
const { getNetwork } = require('@ethersproject/networks')
const { getDefaultProvider, InfuraProvider } = require('@ethersproject/providers')
const web3 = require('web3');
const search = require('./search');

let chainId = ChainId.KOVAN
let network = getDefaultProvider(getNetwork(chainId))
const TOKENS = { //LINK ใช่ไม่ได้ , OMG ใช่ไม่ได้ , TUSD ใช่ไม่ได้
    'ETH': new Token(chainId, "0xd0A1E359811322d97991E03f863a0C30C2cF029C", 18),
    'MKR': new Token(chainId, '0xAaF64BFCC32d0F15873a02163e7E500671a4ffcD', 18),
    //'DAI': new Token(chainId, '0xC4375B7De8af5a38a93548eb8453a498222C4fF2', 18),
    'USDC': new Token(chainId, "0x2F375e94FC336Cdec2Dc0cCB5277FE59CBf1cAe5", 18),
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
    // console.log(priceMatrix);

    const bestRoute = search(priceMatrix, names);
    console.log('max', bestRoute);
}

main()