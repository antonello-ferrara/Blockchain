//libreria da installare moment: serve per il parsing e la manipolazione di date


import { BlockHeader } from "./block-header.js";
import { Block } from "./block.js";
import moment from 'moment';
import cryptoJs from "crypto-js";
import { Db } from "./db.js";


export class MyBlockchain {

    blockHeader;
    merkleRoot;
    prevBlockHeader;
    rawTrx;
    targetDifficulty;
    nonce;
    blockchain;
    db;

    constructor(peerId) {
        //parte4
        this.blockchain = [];
        
        let genesisBlock = this.getGenesisBlock();
        this.blockchain.push(genesisBlock);
        //Parte5
        this.db =new Db(peerId);
        this.db.putBlock(genesisBlock);
    }


    //Genera il primo blocco della catena
    getGenesisBlock() {

        this.merkleRoot = "D3C551A6FF92CF0A016140211303A21C3092A1E49986DDA518420FE11DFFA92D";
        this.prevBlockHeader = 0;
        this.rawTrx = null;
        this.targetDifficulty = 0x1d00ffff;
        this.nonce = 2083236893;
        this.blockHeader = new BlockHeader(1, this.prevBlockHeader, this.merkleRoot, moment().format("X"), this.targetDifficulty, this.nonce);
        return new Block(this.blockHeader, 0, null);

    }

    //Ritorna l'ultimo blocco della catena
    getLatestBlock() {
        console.log(this.db.getBlock(this.blockchain.length-1));
        return (this.blockchain.length === 1) ? this.blockchain[0] : this.blockchain[this.blockchain.length - 1];
    }

    //Aggiunge un blocco alla catena
    addBlock(newBlock) {
        let prevBlock = this.getLatestBlock();
        if (prevBlock.index < newBlock.index && newBlock.blockHeader.previousBlockHeader === prevBlock.blockHeader.merkleRoot) {
            this.blockchain.push(newBlock);
            //Parte5
            this.db.putBlock(newBlock); 
        }
    }

    //Ritorna il blocco nella posizione index della catena
    getBlock(index) {
        //Parte5
        this.db.getBlock ( index );
        return (this.blockchain.length - 1 >= index) ? this.blockchain[index] : null;
    }

    //Parte4: genera un nuovo blocco e lo salva nel db
    generateNextBlock(txns) {

        let prevBlock = this.getLatestBlock();
        let prevMerkleRoot = prevBlock.blockHeader.merkleRoot;
        let nextIndex = prevBlock.index + 1;
        let nextTime = moment().format("X");
        let nextMerkleRoot = cryptoJs.SHA256(1, prevMerkleRoot, nextTime).toString();

        let blockHeader = new BlockHeader(1, prevMerkleRoot, nextMerkleRoot, nextTime);
        let newBlock = new Block(blockHeader, nextIndex, txns);

        return newBlock;
    };

}