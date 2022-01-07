/*
Dichiaro  una classe Block
export è una direttiva ES6 che permette di 
esportare un classe, una funzione o una var
*/
export class Block {

    blockHeader;
    index;
    txns;

    constructor(blockHeader, index, txns) 
    {
        this.blockHeader = blockHeader;//contiene i metadati
        this.index = index;//indice del blocco
        this.txns = txns;//dati della transazione
    }

}