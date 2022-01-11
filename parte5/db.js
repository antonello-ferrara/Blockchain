/*
Parte5 Classe che si interfaccia con levelDb
*/

import LevelDb from 'level';
import fs, { realpathSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


export class Db {

    db;

    constructor(peerId) {
        
        var options = {
            keyEncoding: 'json',
            valueEncoding: 'json'
        };

        
        const dirname = path.dirname(fileURLToPath(import.meta.url));
        let dbPath = `${dirname}\\db\\${peerId}`;
        
        if(!fs.existsSync(dbPath)){
            
            fs.mkdirSync(dbPath);
            console.log("dbPath" + dbPath);

        }
        
        this.db = LevelDb(dbPath,options);
    
    }

    //block.index:chiave
    //block:valore
    putBlock(block) {

        let instance = this;
        this.db.put(block.index, JSON.stringify (block), function (err) {

            if (err) 
                return;
            console.log(`[db.put] inserito blocco con indice ${block.index}`);
                
            
        });


    }


    getBlock(key) {

        let rValue = "";
        let instance = this;

        try{

            this.db.get(key, function (err, value) {

                if (err) 
                    return;
                
                console.log(`[getBlock] ${value}`);
                instance.rValue = value;
                

            });
        }

        catch(exc){console.log(exc);}
              
        return this.rValue;
    }



}
