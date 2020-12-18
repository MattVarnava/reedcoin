const Blockchain = require("./blockchain");
const {send, json} = require("micro");

const blockchain = new Blockchain();


module.exports = async (request, response) => {
    const route = request.url;

    // Keep track of the peers that have contacted us
    blockchain.addPeer(request.headers.host);

    let output;

    switch (route) {
        case "/mine":
            let minedBlock = blockchain.mine();
            blockchain.addTransaction(request.headers.host, 1);
            output = blockchain.newBlock(minedBlock.hash, minedBlock.nonce);
            
            break;

        case "/last_block":
            output = blockchain.lastBlock();
            break;

        case "/chain":
            output = blockchain.getChain();
            break;

        case "/transaction":
            const requestBody = await json(request);
            output = blockchain.addTransaction(requestBody.toAddress, requestBody.amount, request.headers.host);
            break;
        
        case "/coins":                
            output = `You have ${blockchain.calculateWalletValue(request.headers.host)} Reed coins`;
            break;

        default:
            output = blockchain.lastBlock();

    }
    send(response, 200, output);
};