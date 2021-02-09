const { ChainId, Token, WETH, Fetcher, Route, Trade, TokenAmount, TradeType, Percent } = require('@uniswap/sdk')
const { getNetwork } = require('@ethersproject/networks')
const { getDefaultProvider, InfuraProvider } = require('@ethersproject/providers')
const Web3 = require('web3');
const search = require('./search');
const Router02 = require('./contracts/Router02');
const { infura, walletInfo } = require('./config');
const { fromDecimal } = require('./utils');

let web3 = new Web3(infura.endpoint)

// let chainId = ChainId.MAINNET
let chainId = ChainId.KOVAN
let network = getDefaultProvider(getNetwork(chainId))

let RouterContract = Router02(web3);

// mainnet
// const TOKENS = {
//     'ETH': WETH[chainId],
//     'MKR': new Token(chainId, '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2', 18),
//     'DAI': new Token(chainId, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18)
// }

// kovan
const TOKENS = {
    'ETH': WETH[chainId],
    'LCN': new Token(chainId, '0x0b3df94f9a997981c5ad52b0a16a26f6bb6039ed', 4),
    'SolX': new Token(chainId, '0xc0f85ccd1363c6246c60ecb5254d07d4197ed5ae', 4),
    'DAI': new Token(chainId, '0x1528F3FCc26d13F7079325Fb78D9442607781c8C', 18),
    'MKR': new Token(chainId, '0xef13C0c8abcaf5767160018d268f9697aE4f5375', 18),
    'USDC': new Token(chainId, '0x2F375e94FC336Cdec2Dc0cCB5277FE59CBf1cAe5', 6),
    'BAT': new Token(chainId, '0x1f1f156E0317167c11Aa412E3d1435ea29Dc3cCE', 18),
}

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
            priceMatrix[i][j] = i === j ? 1 : await getMidPrice(tokenArr[i], tokenArr[j]);
            console.log(tokenNames[i], tokenNames[j], priceMatrix[i][j]);
        }
    };
    return priceMatrix;
}

const swap = async (TokenA, TokenB, amount) => {
    const pair = await getPair(TokenA, TokenB);
    const route = new Route([pair], TokenA);
    const amountIn = fromDecimal(amount, TokenA.decimals);
    console.log({ amountIn })
    const trade = new Trade(route, new TokenAmount(TokenA, amountIn), TradeType.EXACT_INPUT);

    const slippageTolerance = new Percent('50', '10000') // 50 bips, or 0.50%

    const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw // needs to be converted to e.g. hex
    const path = [TokenA.address, TokenB.address]
    const to = walletInfo.address // should be a checksummed recipient address
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutes from the current Unix time

    console.log({ amountIn, amountOutMin: amountOutMin.toString(), to, deadline });

    return RouterContract.methods.swapExactTokensForTokens(
        web3.utils.toHex(amountIn),
        web3.utils.toHex(amountOutMin.toString()),
        path,
        to,
        deadline,
        { from: walletInfo.address, privateKey: walletInfo.privateKey }
    )
}

const main = async () => {
    // const priceMatrix = await getAllPairMidPrices();
    // const names = Object.keys(TOKENS);
    // console.log(priceMatrix);

    // const bestRoute = search(priceMatrix, names);
    // console.log('max', bestRoute);


    const result = await swap(TOKENS.ETH, TOKENS.MKR, 0.001);
    console.log(result);
}

main()