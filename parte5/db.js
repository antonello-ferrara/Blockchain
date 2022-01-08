/*
Parte5 Classe che si interfaccia con levelDb
*/

import levelDb from 'level';   
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export class Db{

    db;

    constructor(dbName){

        const dirname = path.dirname(fileURLToPath(import.meta.url));
        let dbPath = `${dirname}\\db\\${dbName}`;

        if ( !fs.existsSync(dbPath) ){
            fs.mkdirSync(dbPath);   
        }
        this.db = levelDb(dbPath);
        console.log ("DB creato nel percorso "+dbPath);

    }

    putBlock(block) {

        let instance=this;
        //block.index:chiave
        //block:valore
        this.db.put( block.index, JSON.stringify(block), function (err) {

            if (err)
                console.log(`db.put ha generato un errore: ${err}`);
            else{

                console.log(`Comando db.put eseguito per il blocco con indice ${block.index}`);
                instance.getBlock ( block.index );

            }
                
        });

    }


   getBlock(key) {

        this.db.get(key, function(err, value) {    
            if (err) {  
                console.log(`La lettura del valore con indice ${key} ha generato un eccezione: ${err}`);  
            }  
            console.log(value);  
          });

    }

}
