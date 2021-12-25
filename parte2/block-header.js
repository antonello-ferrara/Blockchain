/*
Dichiaro  una classe BlockHeader 
export è una direttiva ES6 che permette di 
esportare un classe, una funzione o una var
*/

export class BlockHeader{

    constructor(version, previousBlockHeader, merkleRoot, time, nBits, nounce)
    {
        
        this.version = version;//versione del software
        this.previousBlockHeader = previousBlockHeader;//rif al blocco che lo precede nella catena
        this.merkleRoot = merkleRoot;//nodo radice del Merkle tree
        this.time = time;//Dataora creazione blocco
        this.nBits= nBits;//Difficulty Target
        this.nounce = nounce;//Nonce

    }
    
}