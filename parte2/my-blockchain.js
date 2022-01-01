//libreria da installare moment: serve per il parsing e la manipolazione di date

import { BlockHeader } from "./block-header.js"; 
import { Block } from "./block.js";
import moment from 'moment';


export class MyBlockchain
{

    
    blockHeader;
    merkleRoot;
    prevBlockHeader;
    rawTrx;
    targetDifficulty;
    nonce;
    blockchain;

    constructor()
    {
        
        this.merkleRoot = "D3C551A6FF92CF0A016140211303A21C3092A1E49986DDA518420FE11DFFA92D";
        this.prevBlockHeader = 0;
        this.rawTrx=null;
        this.targetDifficulty=0x1d00ffff;
        this.nonce=2083236893;
        this.blockHeader =new BlockHeader ( 1, this.prevBlockHeader, this.merkleRoot, moment().format("X"), this.targetDifficulty, this.nonce );//moment.unix():ritorna il nr di sec dalla Unix Epoch (mezzanotte del 1/1/1970)et block =;
        this.blockchain = [];
        
        this.blockchain.push (this.getGenesisBlock ());
        
    }

    
    //Genera il primo blocco della catena
    getGenesisBlock () {
        return new Block(this.blockHeader, 0, null);
    }

    //Ritorna l'ultimo blocco della catena
    getLatestBlock() {
        return (this.blockchain.length===1)?this.blockchain[0]:this.blockchain[this.blockchain.length - 1];
    }
            
    //Aggiunge un blocco alla catena
    addBlock (newBlock) {
        let prevBlock = this.getLatestBlock();
        if (prevBlock.index < newBlock.index && newBlock.blockHeader.previousBlockHeader === prevBlock.blockHeader.merkleRoot) {
            this.blockchain.push(newBlock);
        }
    }

    //Ritorna il blocco nella posizione index della catena
    getBlock (index) {
        return (this.blockchain.length - 1 >= index) ? this.blockchain[index] : null;
    };
    
    
}