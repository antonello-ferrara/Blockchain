/*

Parte3 classe per la gestione dei nodi miners

*/

export class Miner{

    
    registeredMiners;
    lastBlockMinedBy;//Parte4 contiene l'ultimo blocco minato
    
    constructor(){
        this.registeredMiners = [];
        this.lastBlockMinedBy=null;
    }

    register(miners){

        console.log(miners);

        if (miners==null)
            return;

        miners.forEach(element => {
        
            let exists=false;

            for (let index = 0; index < this.registeredMiners.length; index++) {

                if (this.registeredMiners[index]===element)
                    exists=true;
            }

            if(!exists){
                this.registeredMiners.push(element);
            }

        });

        console.log("*** Elenco miners registrati ***");
        console.log(this.registeredMiners);

    }

    unregister (id){
            
        let index = this.registeredMiners.indexOf(id);
        if (index > -1){
            this.registeredMiners.splice(index, 1);
            console.log(`Miner con indice ${index} rimosso`);
        }

    }

    //Parte4 Ritorna un peerid a caso dall'elenco dei miners escluso
    getRandomItem(){

        if (this.registeredMiners.length<2)
            return "";

        let idx=Math.floor( Math.random() * (this.registeredMiners.length-1) + 1);
        console.log("getRandomItem indice = "+idx);
        return  this.registeredMiners[idx].toString("hex");

    }

}