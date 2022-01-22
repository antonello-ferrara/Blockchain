/*
Parte4 Classe che definisce la transazione
*/

export class Transaction{
    amount;
    recipient;
    sender;

    constructor(amount,recipient,sender){
        if (isNaN(amount)||amount<=0){
            throw "Valore della transazione non valido";
        }
        if(!sender){
            console.error( "Mittente non valido");
        }
        if(!recipient){
            console.error( "Mittente non valido");
        }
        this.amount=amount;
        this.recipient=recipient;
        this.sender=sender;
    }

}