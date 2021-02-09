const express = require('express')
const app = express()
const Web3 = require("web3");
const { ChainId, Token, WETH, Fetcher, Route, Trade, TokenAmount, TradeType, Percent } = require('@uniswap/sdk')
const { getNetwork } = require('@ethersproject/networks')
const { getDefaultProvider, InfuraProvider } = require('@ethersproject/providers')
const config = require('./config');
const Uniswap = require('./contracts/Router02');
const { infura, walletInfo } = config;
const chainId = ChainId.KOVAN;
const web3 = new Web3(infura.endpoint);
const uniswapContract = Uniswap(web3);
var cors = require('cors')
const search = require('./search');
app.use(cors()) // Use this after the variable declaration
const bodyParser = require('body-parser');
const cons = require('consolidate');
const { fromDecimal } = require('./utils');
//const Router02 = require('./contracts/Router02');
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
        'USDC': new Token(chainId, "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", 18),
        'MKR': new Token(chainId, '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2', 18),
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
                priceMatrix[i][j] = i === j ? valueinput : await getMidPrice(tokenArr[i], tokenArr[j]); // 1 = amount
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
        res.send({ bestRoute, valueinput })
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

app.post('/swaptotalcoin', (req, res) => {
    //console.log("Total way form From Frontend-algorithm", req.body.algorithm.data.bestRoute.bestRoute)
    const algorithm = req.body.algorithm.data.bestRoute.bestRoute;
    console.log("algorithm", algorithm.split(" -> "))//ETH -> MKR -> USDC -> ETH
    const arr_algo = algorithm.split(" -> ")
    let chainId = ChainId.KOVAN
    let network = getDefaultProvider(getNetwork(chainId))
    let RouterContract = Uniswap(web3);
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

    const swap = async (TokenA, TokenB, amount) => {
        const pair = await getPair(TokenA, TokenB);
        const route = new Route([pair], TokenA);
        // console.log("amount", amount)
        // console.log("TokenA", TokenA)
        // console.log("TokenB", TokenB)
        const amountIn = fromDecimal(amount, TokenA.decimals);
        console.log({ amountIn })
        const trade = new Trade(route, new TokenAmount(TokenA, amountIn), TradeType.EXACT_INPUT);
        const price = trade.executionPrice.toSignificant(6);
        const total = price * amount;
        console.log("total === >", total)
        console.log(`Trade ${amount} ${TokenA.symbol} to ` + total + `Final way`);
        // console.log("getExecutionPrice", getExecutionPrice())
        const slippageTolerance = new Percent('50', '10000') // 50 bips, or 0.50%
        const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw // needs to be converted to e.g. hex
        const path = [TokenA.address, TokenB.address]
        const to = walletInfo.address // should be a checksummed recipient address
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutes from the current Unix time
        console.log({ amountIn, amountOutMin: amountOutMin.toString(), to, deadline });
        const contractnew = await RouterContract.methods.swapExactTokensForTokens(
            web3.utils.toHex(amountIn),
            web3.utils.toHex(amountOutMin.toString()),
            path,
            to,
            deadline,
            { from: walletInfo.address, privateKey: walletInfo.privateKey }
        )
        return { total, contractnew }
    }
    const main = async () => {
        let arr_amount = req.body.valueinput;
        // let arr_amount = 0.001;
        let transaction_hash = []
        console.log("arr_amount", arr_amount)
        //const result = await swap(TOKENS.USDC, TOKENS.ETH, arr_amount);
        try {
            for (let i = 0; i < arr_algo.length; i++) {
                if (i != arr_algo.length - 1) {
                    console.log("IN", arr_amount)
                    const resultnew = await swap(TOKENS[arr_algo[i]], TOKENS[arr_algo[i + 1]], arr_amount)
                    console.log("token swap else", TOKENS[arr_algo[i]], TOKENS[arr_algo[i + 1]])
                    arr_amount = resultnew.tota
                    // arr_amount = `${arr_amount}`
                    arr_amount =  Number(arr_amount);
                    // `${amount}e+${decimals}`;
                    // console.log("show wei", arr_amount)
                    arr_amount = arr_amount.toFixed(4);
                    // arr_amount = arr_amount.toFixed(7)
                    console.log("hash =>", resultnew.contractnew);
                    transaction_hash.push(resultnew.contractnew.transactionHash)
                }
            }
        } catch (error) {
            console.error("error naja", error)
        }
        console.log("arr_amount Last =======>", arr_amount);
        console.log("transaction_hash", transaction_hash)

        res.send({ arr_amount, transaction_hash })
        // console.log(result.total);
    }
    main()
})
//==============================================================================================================
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

        const SALT_ABI = [{ "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "approve", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "balances", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_value", "type": "uint256" }], "name": "burn", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }, { "name": "", "type": "address" }], "name": "allowed", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "balance", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_from", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "burnFrom", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transfer", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" }], "name": "allowance", "outputs": [{ "name": "remaining", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "_burner", "type": "address" }, { "indexed": false, "name": "_value", "type": "uint256" }], "name": "Burn", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "owner", "type": "address" }, { "indexed": true, "name": "spender", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "from", "type": "address" }, { "indexed": true, "name": "to", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }];
        const SALT_ADDRESS = '0x6fEE5727EE4CdCBD91f3A873ef2966dF31713A04'
        const saltContract = new web3.eth.Contract(SALT_ABI, SALT_ADDRESS);
        //KNC
        const KNC_ABI = [{ "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "approve", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "balances", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_value", "type": "uint256" }], "name": "burn", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }, { "name": "", "type": "address" }], "name": "allowed", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "balance", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_from", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "burnFrom", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transfer", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" }], "name": "allowance", "outputs": [{ "name": "remaining", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "_burner", "type": "address" }, { "indexed": false, "name": "_value", "type": "uint256" }], "name": "Burn", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "owner", "type": "address" }, { "indexed": true, "name": "spender", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "from", "type": "address" }, { "indexed": true, "name": "to", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }];
        const KNC_ADDRESS = '0xad67cB4d63C9da94AcA37fDF2761AaDF780ff4a2'
        const KNCContract = new web3.eth.Contract(KNC_ABI, KNC_ADDRESS);
        //OMH
        const OMG_ABI = [{ "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "approve", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "balances", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_value", "type": "uint256" }], "name": "burn", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }, { "name": "", "type": "address" }], "name": "allowed", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "balance", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_from", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "burnFrom", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transfer", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" }], "name": "allowance", "outputs": [{ "name": "remaining", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "_burner", "type": "address" }, { "indexed": false, "name": "_value", "type": "uint256" }], "name": "Burn", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "owner", "type": "address" }, { "indexed": true, "name": "spender", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "from", "type": "address" }, { "indexed": true, "name": "to", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }];
        const OMG_ADDRESS = '0xdB7ec4E4784118D9733710e46F7C83fE7889596a'
        const OMGContract = new web3.eth.Contract(OMG_ABI, OMG_ADDRESS);
        //MANA
        const MANA_ABI = [{ "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "approve", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "balances", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_value", "type": "uint256" }], "name": "burn", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }, { "name": "", "type": "address" }], "name": "allowed", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "balance", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_from", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "burnFrom", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transfer", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" }], "name": "allowance", "outputs": [{ "name": "remaining", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "_burner", "type": "address" }, { "indexed": false, "name": "_value", "type": "uint256" }], "name": "Burn", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "owner", "type": "address" }, { "indexed": true, "name": "spender", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "from", "type": "address" }, { "indexed": true, "name": "to", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }];
        const MANA_ADDRESS = '0xcb78b457c1F79a06091EAe744aA81dc75Ecb1183'
        const MANAContract = new web3.eth.Contract(MANA_ABI, MANA_ADDRESS);
        //PSU COIN
        const PSU_ABI = [
            {
                "constant": true,
                "inputs": [],
                "name": "name",
                "outputs": [
                    {
                        "name": "",
                        "type": "string"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {
                        "name": "spender",
                        "type": "address"
                    },
                    {
                        "name": "tokens",
                        "type": "uint256"
                    }
                ],
                "name": "approve",
                "outputs": [
                    {
                        "name": "success",
                        "type": "bool"
                    }
                ],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "totalSupply",
                "outputs": [
                    {
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {
                        "name": "from",
                        "type": "address"
                    },
                    {
                        "name": "to",
                        "type": "address"
                    },
                    {
                        "name": "tokens",
                        "type": "uint256"
                    }
                ],
                "name": "transferFrom",
                "outputs": [
                    {
                        "name": "success",
                        "type": "bool"
                    }
                ],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "decimals",
                "outputs": [
                    {
                        "name": "",
                        "type": "uint8"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "_totalSupply",
                "outputs": [
                    {
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [
                    {
                        "name": "tokenOwner",
                        "type": "address"
                    }
                ],
                "name": "balanceOf",
                "outputs": [
                    {
                        "name": "balance",
                        "type": "uint256"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [],
                "name": "acceptOwnership",
                "outputs": [],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "owner",
                "outputs": [
                    {
                        "name": "",
                        "type": "address"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "symbol",
                "outputs": [
                    {
                        "name": "",
                        "type": "string"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [
                    {
                        "name": "a",
                        "type": "uint256"
                    },
                    {
                        "name": "b",
                        "type": "uint256"
                    }
                ],
                "name": "safeSub",
                "outputs": [
                    {
                        "name": "c",
                        "type": "uint256"
                    }
                ],
                "payable": false,
                "stateMutability": "pure",
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {
                        "name": "to",
                        "type": "address"
                    },
                    {
                        "name": "tokens",
                        "type": "uint256"
                    }
                ],
                "name": "transfer",
                "outputs": [
                    {
                        "name": "success",
                        "type": "bool"
                    }
                ],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [
                    {
                        "name": "a",
                        "type": "uint256"
                    },
                    {
                        "name": "b",
                        "type": "uint256"
                    }
                ],
                "name": "safeDiv",
                "outputs": [
                    {
                        "name": "c",
                        "type": "uint256"
                    }
                ],
                "payable": false,
                "stateMutability": "pure",
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {
                        "name": "spender",
                        "type": "address"
                    },
                    {
                        "name": "tokens",
                        "type": "uint256"
                    },
                    {
                        "name": "data",
                        "type": "bytes"
                    }
                ],
                "name": "approveAndCall",
                "outputs": [
                    {
                        "name": "success",
                        "type": "bool"
                    }
                ],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [
                    {
                        "name": "a",
                        "type": "uint256"
                    },
                    {
                        "name": "b",
                        "type": "uint256"
                    }
                ],
                "name": "safeMul",
                "outputs": [
                    {
                        "name": "c",
                        "type": "uint256"
                    }
                ],
                "payable": false,
                "stateMutability": "pure",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "newOwner",
                "outputs": [
                    {
                        "name": "",
                        "type": "address"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {
                        "name": "tokenAddress",
                        "type": "address"
                    },
                    {
                        "name": "tokens",
                        "type": "uint256"
                    }
                ],
                "name": "transferAnyERC20Token",
                "outputs": [
                    {
                        "name": "success",
                        "type": "bool"
                    }
                ],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [
                    {
                        "name": "tokenOwner",
                        "type": "address"
                    },
                    {
                        "name": "spender",
                        "type": "address"
                    }
                ],
                "name": "allowance",
                "outputs": [
                    {
                        "name": "remaining",
                        "type": "uint256"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [
                    {
                        "name": "a",
                        "type": "uint256"
                    },
                    {
                        "name": "b",
                        "type": "uint256"
                    }
                ],
                "name": "safeAdd",
                "outputs": [
                    {
                        "name": "c",
                        "type": "uint256"
                    }
                ],
                "payable": false,
                "stateMutability": "pure",
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {
                        "name": "_newOwner",
                        "type": "address"
                    }
                ],
                "name": "transferOwnership",
                "outputs": [],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "constructor"
            },
            {
                "payable": true,
                "stateMutability": "payable",
                "type": "fallback"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "name": "_from",
                        "type": "address"
                    },
                    {
                        "indexed": true,
                        "name": "_to",
                        "type": "address"
                    }
                ],
                "name": "OwnershipTransferred",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "name": "from",
                        "type": "address"
                    },
                    {
                        "indexed": true,
                        "name": "to",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "name": "tokens",
                        "type": "uint256"
                    }
                ],
                "name": "Transfer",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "name": "tokenOwner",
                        "type": "address"
                    },
                    {
                        "indexed": true,
                        "name": "spender",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "name": "tokens",
                        "type": "uint256"
                    }
                ],
                "name": "Approval",
                "type": "event"
            }
        ]
        const PSU_ADDRESS = '0x0d01bc6041ac8f72e1e4b831714282f755012764'
        const PsuContract = new web3.eth.Contract(PSU_ABI, PSU_ADDRESS);
        let balance
        //0xad67cB4d63C9da94AcA37fDF2761AaDF780ff4a2
        // Ether balance swap
        balance = await web3.eth.getBalance(addressmetamask)
        balance1 = web3.utils.fromWei(balance, 'Ether')
        console.log("Ether Balance:", balance1)
        // Dai balance swap
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
        //SALT
        balance5 = await saltContract.methods.balanceOf(addressmetamask).call()
        balance5 = web3.utils.fromWei(balance5, 'Ether')
        console.log("SALT Balance:", balance5)
        //KNC
        balance6 = await KNCContract.methods.balanceOf(addressmetamask).call()
        balance6 = web3.utils.fromWei(balance6, 'Ether')
        console.log("KNC Balance:", balance6)
        //OMG
        balance7 = await OMGContract.methods.balanceOf(addressmetamask).call()
        balance7 = web3.utils.fromWei(balance7, 'Ether')
        console.log("OMG Balance:", balance7)
        //MANA
        balance8 = await MANAContract.methods.balanceOf(addressmetamask).call()
        balance8 = web3.utils.fromWei(balance8, 'Ether')
        console.log("MANA Balance:", balance8)
        //PSU
        balance9 = await PsuContract.methods.balanceOf(addressmetamask).call()
        balance9 = web3.utils.fromWei(balance9, 'Ether')
        console.log("PSU Balance:", balance9)
        //https://tokens.1inch.exchange/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png
        const payload = [
            //=================================================================================================================================//
            {
                code_coin: "ETH",
                name_coin: "Ethereum",
                images_coin: "https://tokens.1inch.exchange/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png",
                balance_coin: balance1,
            },
            //=================================================================================================================================//
            {
                code_coin: "DAI",
                name_coin: "Dai Stablecoin",
                images_coin: "https://tokens.1inch.exchange/0x6b175474e89094c44da98b954eedeac495271d0f.png",
                balance_coin: balance2,
            },
            //=================================================================================================================================//
            {
                code_coin: "MKR",
                name_coin: "Maker",
                images_coin: "https://tokens.1inch.exchange/0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2.png",
                balance_coin: balance3,
            },
            //=================================================================================================================================//
            {
                code_coin: "WETH",
                name_coin: "Wrapped Ether",
                images_coin: "https://tokens.1inch.exchange/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png",
                balance_coin: balance4,
            },
            //=================================================================================================================================//
            {
                code_coin: "SALT",
                name_coin: "Salt",
                images_coin: "https://tokens.1inch.exchange/0x4156d3342d5c385a87d264f90653733592000581.png",
                balance_coin: balance5,
            },
            //=================================================================================================================================//
            {
                code_coin: "KNC",
                name_coin: "KyberNetwork",
                images_coin: "https://tokens.1inch.exchange/0xdd974d5c2e2928dea5f71b9825b8b646686bd200.png",
                balance_coin: balance6,
            },
            //=================================================================================================================================//
            {
                code_coin: "OMG",
                name_coin: "OmiseGO",
                images_coin: "https://tokens.1inch.exchange/0xd26114cd6ee289accf82350c8d8487fedb8a0c07.png",
                balance_coin: balance7,
            },
            //=================================================================================================================================//
            {
                code_coin: "MANA",
                name_coin: "Mana",
                images_coin: "https://tokens.1inch.exchange/0x0f5d2fb29fb7d3cfee444a200298f468908cc942.png",
                balance_coin: balance8,
            },
            //=================================================================================================================================//
            // {
            //     code_coin: "POLY",
            //     name_coin: "Polymath",
            //     images_coin: "https://tokens.1inch.exchange/0x9992ec3cf6a55b00978cddf2b27bc6882d88d1ec.png",
            //     balance_coin: balance8,
            // },
            //=================================================================================================================================//
            {
                code_coin: "PSU",
                name_coin: "PSU COIN",
                images_coin: "data:image/png;base64,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",
                balance_coin: balance9,
            },
            //data:image/png;base64,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

        ]
        res.send(payload)
    }
    checkBalances();
})

app.get('/test', (req, res) => {
    res.send("success good job !!!!!")
})

const PORT = process.env.PORT || 6001;

app.listen(PORT, () => {
    console.log(`Start server at port ${PORT}.`)
})