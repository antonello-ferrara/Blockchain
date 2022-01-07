/*
Dichiaro  una classe BlockHeader 
export è una direttiva ES6 che permette di 
esportare un classe, una funzione o una var
*/

export class BlockHeader{

    version;//versione del software
    previousBlockHeader;//rif al blocco che lo precede nella catena
    merkleRoot;//nodo radice del Merkle tree
    time;//Dataora creazione blocco
    nBits;//Difficulty Target
    nounce;

    constructor(version, previousBlockHeader, merkleRoot, time, nBits, nounce)
    {
        
        this.version = version;
        this.previousBlockHeader = previousBlockHeader;
        this.merkleRoot = merkleRoot;
        this.time = time;
        this.nBits= nBits;
        this.nounce = nounce;

    }
    
}