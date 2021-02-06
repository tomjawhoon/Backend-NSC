const express = require('express')
const app = express()
const Web3 = require("web3");
const { ChainId, Token, WETH, Fetcher, Route, Trade, TokenAmount, TradeType, Percent } = require('@uniswap/sdk')
const { getNetwork } = require('@ethersproject/networks')
const { getDefaultProvider, InfuraProvider } = require('@ethersproject/providers')
const config = require('./config');
const Uniswap = require('./contracts/uniswap');
const { infura, walletInfo } = config;
const chainId = ChainId.KOVAN;
const web3 = new Web3(infura.endpoint);
const uniswapContract = Uniswap(web3);
var cors = require('cors')
const search = require('./search');
app.use(cors()) // Use this after the variable declaration
const bodyParser = require('body-parser');
const cons = require('consolidate');
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
//==============================================================================================================
app.post('/checkcoin', (req, res) => {
    const from = req.body.fromtoken
    const valueinput = req.body.valueinput
    console.log("from =>", from)
    console.log("valueinput =>", valueinput)
    let chainId = ChainId.MAINNET
    let network = getDefaultProvider(getNetwork(chainId))
    const TOKENS = { //LINK ใช่ไม่ได้ , OMG ใช่ไม่ได้ , TUSD ใช่ไม่ได้
        'ETH': new Token(chainId, "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", 18),
        'MKR': new Token(chainId, '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2', 18),
        'DAI': new Token(chainId, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18),
        'UNI': new Token(chainId, "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", 18),
        'USDT': new Token(chainId, "0xdAC17F958D2ee523a2206206994597C13D831ec7", 18),
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
        res.send(bestRoute)
    }

    main()
})
//==============================================================================================================
app.post('/swapcoin', (req, res) => {
    // console.log("coin", req.body.test)
    console.log("Hash Hash  Hash", req.body.test)//ETH -> MKR -> USDC -> ETH
    const tokenfromnode = req.body.test;
    const arrtoken = [];
    /*  for (let i = 0; i < tokenfromnode.length; i++) {
          arrtoken.push(tokenfromnode[i])
      };*/
    console.log("tokenfromnode", tokenfromnode)
    const tokens = {
        dai: {
            address: '0xC4375B7De8af5a38a93548eb8453a498222C4fF2',
            decimals: 18
        },
        usdc: {
            address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            decimals: 6
        },
        lcn: {
            address: '0x0b3df94f9a997981c5ad52b0a16a26f6bb6039ed',
            decimals: 10
        },
        mkr: {
            address: '0xaaf64bfcc32d0f15873a02163e7e500671a4ffcd',
            decimals: 18
        },

        knc: {
            address: '0xad67cB4d63C9da94AcA37fDF2761AaDF780ff4a2',
            decimals: 18
        },

        omg: {
            address: '0xd26114cd6ee289accf82350c8d8487fedb8a0c07',
            decimals: 18
        }



    }

    const DAI = new Token(chainId, tokens.dai.address, tokens.dai.decimals);
    const USDC = new Token(chainId, tokens.usdc.address, tokens.usdc.decimals);
    const LCN = new Token(chainId, tokens.lcn.address, tokens.lcn.decimals);
    const MKR = new Token(chainId, tokens.mkr.address, tokens.mkr.decimals);
    const KNC = new Token(chainId, tokens.knc.address, tokens.knc.decimals);
    const OMG = new Token(chainId, tokens.omg.address, tokens.omg.decimals);


    const main = async () => {
        // const USDCWETHPair = await Fetcher.fetchPairData(USDC, WETH[ChainId.MAINNET])
        // const DAIUSDCPair = await Fetcher.fetchPairData(DAI, USDC)
        // const WETHDAIPair = await Fetcher.fetchPairData(DAI, WETH[chainId]);
        // const route = new Route([DAIUSDCPair], DAI);
        // const trade = new Trade(route, new TokenAmount(DAI, '1000000000000000000'), TradeType.EXACT_INPUT)
        const MKRWETHPair = await Fetcher.fetchPairData(MKR, WETH[chainId]);
        const route = new Route([MKRWETHPair], WETH[chainId]);
        const numbercoin = req.body.valueinput;
        const amount = numbercoin;
        console.log("amountamountamountamountamountamountamountamountamountamountamount", amount)
        const amountIn = web3.utils.toWei(amount, 'ether')
        const trade = new Trade(route, new TokenAmount(WETH[chainId], amountIn), TradeType.EXACT_INPUT)
        console.log(`Trade ${amount} ETH to ` + trade.executionPrice.toSignificant(6) + ` MKR`);
        const slippageTolerance = new Percent('100') // 50 bips, or 0.50%
        const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw.toString()
        const path = [WETH[MKR.chainId].address, MKR.address]
        const to = walletInfo.address
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20
        const value = trade.inputAmount.raw.toString()
        console.log(path);
        console.log(trade.inputAmount.raw.toString());
        const transaction = await uniswapContract.methods.swapExactETHForTokens(
            amountOutMin,
            path,
            to,
            deadline,
            { from: walletInfo.address, privateKey: walletInfo.privateKey, value },
        )
        console.log('show transaction', transaction.transactionHash);
        res.send(transaction.transactionHash)
    }
    main();
})
//==============================================================================================================
app.post('/totalcoin', (req, res) => {
    const getExecutionPrice = async (baseToken, baseDecimal, quoteToken, quoteDecimal, tradeAmount, chainId, infuraKey) => {
        if (chainId == undefined) {
            chainId = ChainId.MAINNET
        }
        let network
        if (infuraKey != undefined) {
            network = new InfuraProvider(getNetwork(chainId), infuraKey)
        } else {
            network = getDefaultProvider(getNetwork(chainId))
        }
        let base = new Token(chainId, baseToken, baseDecimal),
            quote = new Token(chainId, quoteToken, quoteDecimal),
            pair = await Fetcher.fetchPairData(quote, base, network),
            route = await new Route([pair], base),
            base2quote = await route.midPrice.toSignificant(6),
            quote2base = await route.midPrice.invert().toSignificant(6),
            trade = new Trade(route, new TokenAmount(base, tradeAmount), TradeType.EXACT_INPUT)
        return trade.executionPrice.toSignificant(6)
    }

    const main = async () => {
        //const WETH =  0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
        //const DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
        //const OMG = 0xd26114cd6ee289accf82350c8d8487fedb8a0c07
        //const MKR = 0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2
        //const USDT = 0x8dd5fbce2f6a956c3022ba3663759011dd51e73e
        let data
        const amount = req.body.valueinput;
        //console.log("amount amount amount ", amount)
        const frontend_value = amount;
        console.log("show <====  ", frontend_value)
        //WETH <== DAI
        // data = await getMidPrice("0xd26114cd6ee289accf82350c8d8487fedb8a0c07", 18, "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2", 18)
        // console.log("SHOW", data)
        //WETH <== DAI
        data = await getExecutionPrice(req.body.fromtoken, 18, req.body.totoken, 18, web3.utils.toWei(frontend_value, 'ETHER'))
        console.log("1 DAI = 1 WETH <===", data)
        console.log(`1 DAI = 1 WETH * ${frontend_value}-->`, data * frontend_value)

        const result = JSON.stringify(data * frontend_value);
        console.log(`result-->`, result)
        res.send(result)
    }
    main()
    module.exports = {
        getExecutionPrice: getExecutionPrice,
    }
})

app.post('/checkbalance', (req, res) => {
    console.log("show => addressMetamask", req.body.addressMetamask)
    const addressmetamask = req.body.addressMetamask;
    async function checkBalances() {
        const DAI_ABI = [{ "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "bytes32" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "stop", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "guy", "type": "address" }, { "name": "wad", "type": "uint256" }], "name": "approve", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "owner_", "type": "address" }], "name": "setOwner", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "src", "type": "address" }, { "name": "dst", "type": "address" }, { "name": "wad", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "guy", "type": "address" }, { "name": "wad", "type": "uint256" }], "name": "mint", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "wad", "type": "uint256" }], "name": "burn", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "name_", "type": "bytes32" }], "name": "setName", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "src", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "stopped", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "authority_", "type": "address" }], "name": "setAuthority", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "bytes32" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "guy", "type": "address" }, { "name": "wad", "type": "uint256" }], "name": "burn", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "wad", "type": "uint256" }], "name": "mint", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "dst", "type": "address" }, { "name": "wad", "type": "uint256" }], "name": "transfer", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "dst", "type": "address" }, { "name": "wad", "type": "uint256" }], "name": "push", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "src", "type": "address" }, { "name": "dst", "type": "address" }, { "name": "wad", "type": "uint256" }], "name": "move", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "start", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "authority", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "guy", "type": "address" }], "name": "approve", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "src", "type": "address" }, { "name": "guy", "type": "address" }], "name": "allowance", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "src", "type": "address" }, { "name": "wad", "type": "uint256" }], "name": "pull", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "name": "symbol_", "type": "bytes32" }], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "guy", "type": "address" }, { "indexed": false, "name": "wad", "type": "uint256" }], "name": "Mint", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "guy", "type": "address" }, { "indexed": false, "name": "wad", "type": "uint256" }], "name": "Burn", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "authority", "type": "address" }], "name": "LogSetAuthority", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "owner", "type": "address" }], "name": "LogSetOwner", "type": "event" }, { "anonymous": true, "inputs": [{ "indexed": true, "name": "sig", "type": "bytes4" }, { "indexed": true, "name": "guy", "type": "address" }, { "indexed": true, "name": "foo", "type": "bytes32" }, { "indexed": true, "name": "bar", "type": "bytes32" }, { "indexed": false, "name": "wad", "type": "uint256" }, { "indexed": false, "name": "fax", "type": "bytes" }], "name": "LogNote", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "src", "type": "address" }, { "indexed": true, "name": "guy", "type": "address" }, { "indexed": false, "name": "wad", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "src", "type": "address" }, { "indexed": true, "name": "dst", "type": "address" }, { "indexed": false, "name": "wad", "type": "uint256" }], "name": "Transfer", "type": "event" }]
        const DAI_ADDRESS = '0xC4375B7De8af5a38a93548eb8453a498222C4fF2'
        const daiContract = new web3.eth.Contract(DAI_ABI, DAI_ADDRESS);
        // MKR (Maker)
        const MKR_ABI = [{ "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "bytes32" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "stop", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "guy", "type": "address" }, { "name": "wad", "type": "uint256" }], "name": "approve", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "owner_", "type": "address" }], "name": "setOwner", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "src", "type": "address" }, { "name": "dst", "type": "address" }, { "name": "wad", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "guy", "type": "address" }, { "name": "wad", "type": "uint256" }], "name": "mint", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "wad", "type": "uint256" }], "name": "burn", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "name_", "type": "bytes32" }], "name": "setName", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "src", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "stopped", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "authority_", "type": "address" }], "name": "setAuthority", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "bytes32" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "guy", "type": "address" }, { "name": "wad", "type": "uint256" }], "name": "burn", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "wad", "type": "uint256" }], "name": "mint", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "dst", "type": "address" }, { "name": "wad", "type": "uint256" }], "name": "transfer", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "dst", "type": "address" }, { "name": "wad", "type": "uint256" }], "name": "push", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "src", "type": "address" }, { "name": "dst", "type": "address" }, { "name": "wad", "type": "uint256" }], "name": "move", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "start", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "authority", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "guy", "type": "address" }], "name": "approve", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "src", "type": "address" }, { "name": "guy", "type": "address" }], "name": "allowance", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "src", "type": "address" }, { "name": "wad", "type": "uint256" }], "name": "pull", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "name": "symbol_", "type": "bytes32" }], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "guy", "type": "address" }, { "indexed": false, "name": "wad", "type": "uint256" }], "name": "Mint", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "guy", "type": "address" }, { "indexed": false, "name": "wad", "type": "uint256" }], "name": "Burn", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "authority", "type": "address" }], "name": "LogSetAuthority", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "owner", "type": "address" }], "name": "LogSetOwner", "type": "event" }, { "anonymous": true, "inputs": [{ "indexed": true, "name": "sig", "type": "bytes4" }, { "indexed": true, "name": "guy", "type": "address" }, { "indexed": true, "name": "foo", "type": "bytes32" }, { "indexed": true, "name": "bar", "type": "bytes32" }, { "indexed": false, "name": "wad", "type": "uint256" }, { "indexed": false, "name": "fax", "type": "bytes" }], "name": "LogNote", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "src", "type": "address" }, { "indexed": true, "name": "guy", "type": "address" }, { "indexed": false, "name": "wad", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "src", "type": "address" }, { "indexed": true, "name": "dst", "type": "address" }, { "indexed": false, "name": "wad", "type": "uint256" }], "name": "Transfer", "type": "event" }]
        const MKR_ADDRESS = '0xAaF64BFCC32d0F15873a02163e7E500671a4ffcD'
        const mkrContract = new web3.eth.Contract(MKR_ABI, MKR_ADDRESS);
        //WETH  0xd0A1E359811322d97991E03f863a0C30C2cF029C
        const WETH_ABI = [{ "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "guy", "type": "address" }, { "name": "wad", "type": "uint256" }], "name": "approve", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "src", "type": "address" }, { "name": "dst", "type": "address" }, { "name": "wad", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "wad", "type": "uint256" }], "name": "withdraw", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "dst", "type": "address" }, { "name": "wad", "type": "uint256" }], "name": "transfer", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "deposit", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }, { "name": "", "type": "address" }], "name": "allowance", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "payable": true, "stateMutability": "payable", "type": "fallback" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "src", "type": "address" }, { "indexed": true, "name": "guy", "type": "address" }, { "indexed": false, "name": "wad", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "src", "type": "address" }, { "indexed": true, "name": "dst", "type": "address" }, { "indexed": false, "name": "wad", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "dst", "type": "address" }, { "indexed": false, "name": "wad", "type": "uint256" }], "name": "Deposit", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "src", "type": "address" }, { "indexed": false, "name": "wad", "type": "uint256" }], "name": "Withdrawal", "type": "event" }];
        const WETH_ADDRESS = '0xd0A1E359811322d97991E03f863a0C30C2cF029C'
        const wethContract = new web3.eth.Contract(WETH_ABI, WETH_ADDRESS);
        let balance
        // Check Ether balance swap
        balance = await web3.eth.getBalance(addressmetamask)
        balance1 = web3.utils.fromWei(balance, 'Ether')
        console.log("Ether Balance:", balance1)
        // Check Dai balance swap
        balance2 = await daiContract.methods.balanceOf(addressmetamask).call()
        balance2 = web3.utils.fromWei(balance2, 'Ether')
        console.log("Dai Balance:", balance2)
        // MKR (Maker)
        balance3 = await mkrContract.methods.balanceOf(addressmetamask).call()
        balance3 = web3.utils.fromWei(balance3, 'Ether')
        console.log("Mkr Balance:", balance3)
        //WETH
        balance4 = await wethContract.methods.balanceOf(addressmetamask).call()
        balance4 = web3.utils.fromWei(balance4, 'Ether')
        console.log("WETH Balance:", balance4)

        res.send({ balance, balance2, balance3, balance4 })
    }
    checkBalances();

})
app.listen(5001, () => {
    console.log('Start server at port 5001.')
})