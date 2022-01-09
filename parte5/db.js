/*
Parte5 Classe che si interfaccia con levelDb
*/

import levelDb from 'level';   
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


export class Db{

    db;
    lastIndex=0;

    constructor(){

        var options = {   
            //keyEncoding: 'binary',
            valueEncoding: 'json'
        };

        let idx=0;
        const dirname = path.dirname(fileURLToPath(import.meta.url));
        let dbPath = `${dirname}\\db\\peer_${idx}`;

        while( fs.existsSync(dbPath) ){

            idx++;
            dbPath = `${dirname}\\db\\peer_${idx}`;

        }
        
        console.log("dbPath"+dbPath);
        fs.mkdirSync(dbPath);
        this.db = levelDb(dbPath, options);
        this.db.open();

        if (this.db.isOpen())
            console.log("Connessione db ok!");

    }

    //block.index:chiave
    //block:valore
    putBlock(block) {

        let instance=this;
        this.db.put( block.index, block, function (err) {

            if (err){
                console.log(`[db.put] ha generato un errore: ${err}`);
                return;
            }
            else{

                instance.lastIndex=block.index;
                console.log(`[db.put] inserito blocco con indice ${instance.lastIndex}`);
                //instance.getBlock ( instance.lastIndex );
                
            }                
        });

        
    }


   getBlock(key) {

        let rValue;
        let instance=this;

        this.db.get(key-1, function(err, value) {  

            if (err) {  

                console.log(`[getBlock] ha generato un eccezione: ${err}`);  
                instance.rValue = "";

            }  
            else{
                instance.rValue = value ;  
            }

        });
    
        console.log( "[getBlock] "+rValue );
        return rValue;
    }

    //TODO:Ripristino la catena da db
    getAllBlocks(){

        let result="";
        let idx=0;  
        let blocks=[];

        
        do{
            
            result = this.getBlock(idx);
            
            if (result!=undefined&&result!==""){

                blocks.push(this.result);
                idx++;

            }             
            
        }
        while(result!=undefined&&result!=="")
        
        return blocks;

    }

}
