const IUniswapV2Router02 = require('./IUniswapV2Router02.json')
const { sender } = require('../utils');

const address = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
const ABI = IUniswapV2Router02;

const Router02 = (web3) => {
    const contract = new web3.eth.Contract(ABI, address);
    const sendTransaction = sender(web3, address);

    // send

    const swapExactTokensForTokens = (amountIn, amountOutMin, path, to, deadline, { from, privateKey, value }) => {
        const methodData = contract.methods.swapExactTokensForTokens(amountIn, amountOutMin, path, to, deadline);
        return sendTransaction(methodData, { from, privateKey, value });
    }
    return {
        contract,
        methods: {
            swapExactTokensForTokens
        },
        events: {
        }
    }
}

module.exports = Router02;

