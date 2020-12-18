const crypto = require("crypto");


class Blockchain {
    constructor() {
        this.chain = [];
        this.pendingTransactions = [];
        this.newBlock();
        this.peers = new Set();
    }

    /**
     * Adds a node to our peer table
     */
    addPeer(host) {
        this.peers.add(host);
    }

    /**
     * Adds a node to our peer table
     */
    getPeers() {
        return Array.from(this.peers);
    }

    /**
     * Creates a new block containing any outstanding transactions
     */
    newBlock(previousHash, nonce) {

        let block = {
            index: this.chain.length,
            timestamp: new Date().toISOString(),
            transactions: this.pendingTransactions,
            nonce
        };

        if(this.chain.length > 0) {
            block.previousHash = this.chain[this.chain.length - 1].hash
        }

        console.log(previousHash);
        console.log(nonce);
        block.hash = Blockchain.hash(previousHash, nonce);

        console.log(`Created block ${block.index}`);

        // Add the new block to the blockchain
        this.chain.push(block);

        // Reset pending transactions
        this.pendingTransactions = [];

        let response = {
            message: 'New block mined! You have been compensated 1 Reedcoin',
            ...this.lastBlock()
        }

        return response;
    }

    /**
     * Generates a SHA-256 hash of the block
     */
    static hash(hash, nonce) {
        const blockString = `${hash}${nonce}`;
        return crypto.createHash("sha256").update(blockString).digest("hex");
    }

    /**
     * Returns the last block in the chain
     */
    lastBlock() {
        return this.chain.length && this.chain[this.chain.length - 1];
    }

    /**
     * Determines if a hash begins with a "difficulty" number of 0s
     *
     * @param hashOfBlock: the hash of the block (hex string)
     * @param difficulty: an integer defining the difficulty
     */
    static powIsAcceptable(hashOfBlock, difficulty) {
        return hashOfBlock.slice(0, difficulty) === "0".repeat(difficulty);
    }

    /**
     * Generates a random 32 byte string
     */
    static nonce() {
        return crypto.createHash("sha256").update(crypto.randomBytes(32)).digest("hex");
    }

    /**
     * add a transaction
     * @param {String} host who mined block 
     * @param {*} amount reward amount
     */
    addTransaction(toAddress, amount, fromAddress = 0) {
        toAddress = crypto.createHash("sha256").update(toAddress).digest("hex");
        if(fromAddress !== 0){
            fromAddress = crypto.createHash("sha256").update(fromAddress).digest("hex");
        }      

        let transaction = {
            fromAddress,
            toAddress,
            amount,
            timestamp: new Date().toISOString(),
        }
        this.pendingTransactions.push(transaction);
        return transaction;
    }

    getChain() {
        return this.chain;
    }

    getToAddress(host) {
        let toAddress = crypto.createHash("sha256").update(host).digest("hex"); 
        return toAddress;
    }

    calculateWalletValue(host) {
        let chain = this.getChain();
        let amount = 0;
        chain.forEach((c) => {
            let received = c.transactions.filter((transaction) => {
                return transaction.toAddress === this.getToAddress(host);
            });
            let removed = c.transactions.filter((transaction) => {
                return transaction.fromAddress === this.getToAddress(host);
            });
            received.forEach(function(validTransaction) {
                amount += validTransaction.amount;
            });
            removed.forEach(function(validTransaction) {
                amount -= validTransaction.amount;
            });
        });
        return amount;
    }

    /**
     * Proof of Work mining algorithm
     *
     * We hash the block with random string until the hash begins with
     * a "difficulty" number of 0s.
     */
    mine(blockToMine = null, difficulty = 4) {
        console.log(this.lastBlock());
        const block = blockToMine || this.lastBlock();

        while (true) {
            let nonce = Blockchain.nonce();
            let blockCalc = {
                ...block,
                nonce
            }
            if (Blockchain.powIsAcceptable(Blockchain.hash(blockCalc.hash, blockCalc.nonce), difficulty)) {
                console.log("We mined a block!")
                console.log(` - Block hash: ${Blockchain.hash(blockCalc.hash, blockCalc.nonce)}`);
                console.log(` - nonce:      ${nonce}`);
                return blockCalc;
            }
        }
    }
}

module.exports = Blockchain;