/*

Parte7
Middleware per chiamte http in formato json,raw,url,text

*/

import express from 'express';
import bodyParser from 'body-parser';


export class HttpServer{

    constructor(){}

    run (http_port, myBlockchain, wallet) {
 
        let app = express();       
        app.use(bodyParser.json());
       
        
        app.get('/getGenesisBlock', (req, res) => {
            res.send(myBlockchain.blockchain[0]);
        });

        app.get('/getLatestBlock', (req, res) => {
            let index=myBlockchain.blockchain.length-1;
            res.send(myBlockchain.blockchain[index]);
        });


        app.get('/getPublicAddress', (req, res) => {
            res.send(JSON.stringify(wallet.publicAddress));
        });

              
        app.listen(http_port, () => console.log(`HTTP Server in ascolto sulla porta: ${http_port}`));
        
        console.log("*** Elenco dei metodi wep Api - INZIO ***");
        
        app._router.stack.forEach(function(r){
            if (r.route && r.route.path){
                console.log(r.route.path);
            }
        });
       
        console.log("*** Elenco dei metodi wep Api - FINE ***");

    };

}