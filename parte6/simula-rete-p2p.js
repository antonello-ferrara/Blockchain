/*

Programmazione Blockchain parte3
Registrazione dei nodi miner

Librerie da installare

crypto:libreria JavaScript per la crittografia
discovery-swarm:serve per collegarsi al nodo p2p
dat-swarm-defaults: cerca altri nodi all'interno della rete
get-port: apre una porta TCP

*/

import { randomBytes } from 'crypto';
import Swarm from 'discovery-swarm';
import defaults from 'dat-swarm-defaults';
import getPort from 'get-port';
import { MyBlockchain } from './my-blockchain.js';//Parte2: rif alla classe MyBlockchain 
import { Miner } from './miner.js';//Parte3
import { Transaction } from './transaction.js';//Parte4 
import { Wallet } from './wallet.js';



const peers = {};//definiamo come costante per evitare che i rif dei nodi possano variare
let connSeq = 0;
let channel = 'BlockchainChannel';
let miner = new Miner();//parte4

const myPeerId = randomBytes(32);
console.log(`Nodo corrente: ${myPeerId.toString('hex')}`);
let myBlockchain = new MyBlockchain(myPeerId.toString('hex'));
//Parte6 - Inizio
new Wallet(myPeerId);


//Parte2: Var dei tipi di messaggi scambiati tra i nodi 
let MessageType = {
    REQUEST_BLOCK: 'requestBlock',
    RECEIVE_NEXT_BLOCK: 'receiveNextBlock',
    REQUEST_ALL_REGISTER_MINERS: 'requestAllRegisterMiners',//Parte3
    REGISTER_MINER: 'registerMiner',//Parte3
    RECEIVE_NEW_BLOCK:'receiveNewBlock'//Parte4
};


//Parte3:scrive il mio peer nell'array dei miners
let curPeer=[];
curPeer.push(myPeerId.toString('hex'));
miner.register ( curPeer );



const config = defaults({
    id: myPeerId,
});

const swarm = Swarm(config);

/*
funzione array asincrona che monitora gli eventi generati dall'istanza della classe swarm
*/
(async () => {
    const port = await getPort();

    swarm.listen(port);
    console.log(`Porta ${port} in ascolto`);

    swarm.join(channel);

    //Parte3:aggiunto evento che scrive su console eventuali errori di connessione
    swarm.on('connect-failed', function (peer, details) {

        console.error(`*** Connessione fallita  ${details} ***`);
        console.error(`${peer}`);
        

    })

    //Evento che si genera in caso di connessione con un nodo
    swarm.on('connection', (conn, info) => {

        //console.log(conn + " " + info);

        const seq = connSeq;
        const peerId = info.id.toString('hex');

        //console.log(`Connessione #${seq} al nodo ${peerId}`);


        conn.on('data', data => {
            
            let message ="";
            try{
                message = JSON.parse(data);
            }
            catch(exc){
                return;
            }
            
            console.log('*** Avvio Ricezione Messaggi ***');
            console.log('Dal nodo: ' + peerId.toString('hex'));
            console.log('Al nodo: ' + peerId.toString(message.to));
            console.log('Nodo corrente: ' + myPeerId.toString('hex'));
            console.log('Tipo messaggio: ' + JSON.stringify(message.type));
            //console.log('Contenuto del messaggio: ' + JSON.stringify(message.data));
            console.log('*** Fine Ricezione Messaggi ***');

            //Switch del tipo di messaggio ricevuto (Parte2) 
            switch (message.type) {
                case MessageType.REQUEST_BLOCK:
                   //Riceve da un nodo la richiesta di trasmissione del blocco con indice contenuto nel messaggio
                    console.log('*** Richiesta blocco INZIO ***');
                    let requestedIndex = (JSON.parse(JSON.stringify(message.data))).index;
                    let requestedBlock = myBlockchain.getBlock(requestedIndex);
                    
                    if (requestedBlock)
                        writeMessageToPeerToId(peerId.toString('hex'), MessageType.RECEIVE_NEXT_BLOCK, requestedBlock);
                    
                    
                    console.log('*** Richiesta blocco FINE ***');
                    break;

                case MessageType.RECEIVE_NEXT_BLOCK:

                    //Chiede il blocco successivo ai nodi della rete
                    console.log('*** Ricezione blocco INZIO ***');
                    myBlockchain.addBlock(JSON.parse(JSON.stringify(message.data)));
                    console.log(JSON.stringify(myBlockchain.blockchain));
                    let nextBlockIndex = myBlockchain.getLatestBlock().index+1;
                    writeMessageToPeers(MessageType.REQUEST_BLOCK, {index: nextBlockIndex});
                    console.log('*** Ricezione blocco FINE ***');

                    break;

                /* Parte 3 INIZIO */
               
                case MessageType.REQUEST_ALL_REGISTER_MINERS:

                    console.log('*** Trasmette i nodi miners ***' + message.to);
                    writeMessageToPeerToId(peerId.toString('hex'),MessageType.REGISTER_MINER, miner.registeredMiners);

                    break;
                case MessageType.REGISTER_MINER:

                    console.log('*** Registrazione dei nodi miners ***' + message.to);
                    let miners = JSON.stringify(message.data);
                    miner.register( JSON.parse(miners) );
                    
                    break;
                /* Parte 3 FINE */

                /*Parte4 Inizio */
                case MessageType.RECEIVE_NEW_BLOCK:

                    if ( message.to === myPeerId.toString('hex') && message.from !== myPeerId.toString('hex')) {
                        console.log( `*** Ricezione nuovo blocco *** `);
                       
                        myBlockchain.addBlock(JSON.parse(JSON.stringify(message.data)));
                        console.log(JSON.stringify(myBlockchain.blockchain));
                       
                    }

                break;
                /*Parte4 Fine */
            }

        });//end switch

        conn.on('close', () => {
            //console.log(`Connessione #${seq} chiusa verso il nodo: ${peerId}`);
            if (peers[peerId].seq === seq) {
                delete peers[peerId];
                miner.unregister(peerId);//Parte3
            }
        });


        if (!peers[peerId]) {
            peers[peerId] = {}
        }

        peers[peerId].conn = conn;
        peers[peerId].seq = seq;
        connSeq++
    })
})();

//Ogni 5 sec chiede l'ultimo blocco disponibile
setInterval(function () {

    try{
        let idx = myBlockchain.getLatestBlock().index;
        writeMessageToPeers(MessageType.REQUEST_BLOCK, { index: idx });
    }
    catch(exc){}
    
    
}, 5000);

//Parte3:funzione eseguita una volta sola dopo 5sec che chiede i miners agli nodi
setInterval(function () {

    console.log('***  Richiesta nodi miners ***')
    writeMessageToPeers(MessageType.REQUEST_ALL_REGISTER_MINERS, null);

}, 7000);

//Parte4 ogni 31 sec genera un nuovo blocco
setInterval(function () {

    let index = 0; // first block

    if ( miner.lastBlockMinedBy ) 
    {
        let newIndex = miner.registeredMiners.indexOf( miner.lastBlockMinedBy );
        index = ( newIndex+1 > miner.registeredMiners.length-1 ) ? 0 : newIndex + 1;
    }

    miner.lastBlockMinedBy = miner.registeredMiners[index];
    
    
    if ( miner.registeredMiners.length > 1 && miner.registeredMiners[index] === myPeerId.toString('hex') ) 
    {

        let amount= (Math.random() * (100 - 1) + 1).toFixed(2);
        let recipient=miner.getRandomItem();
        let sender=myPeerId.toString('hex');
        let trx=new Transaction ( amount, recipient, sender );
        console.log('*** Nuova transazione ***');
        console.log(JSON.stringify(trx));

        
        let newBlock = myBlockchain.generateNextBlock(trx);
        myBlockchain.addBlock(newBlock);
        console.log('***  Nuovo blocco ***');
        console.log(JSON.stringify(newBlock));
        writeMessageToPeers(MessageType.RECEIVE_NEW_BLOCK, newBlock);
        console.log(JSON.stringify(myBlockchain.blockchain));
        
    }

}, 31000);

//Parte2:invia un messaggio a tutti i nodi della rete 
function writeMessageToPeers(type, data) {

    for (let id in peers) {
        
        console.log('*** Inizio scrittura messaggio ai nodi della rete ***');
        console.log(`tipo messaggio: ${type} `);
        console.log(`contenuto ${data}`);
        console.log(`nodo di destinazione ${id}`);
        console.log('*** Fine scrittura messaggio ai nodi della rete *** ');
        
        sendMessage(id, type, data);
    }
};

//Invia un messaggi ad un nodo 
function writeMessageToPeerToId(toId, type, data) {
    for (let id in peers) {
        if (id === toId) {
            /*
            console.log('*** Inizio scrittura messaggio al nodo della rete ***');
            console.log(`Tipo Messaggio ${type} Nodo Id ${toId}`);
            console.log('*** Fine scrittura messaggio al nodo della rete *** ');
            */
            sendMessage(id, type, data);
        }
    }
};


function sendMessage(id, type, data) {
    peers[id].conn.write(JSON.stringify(
        {
            to: id,
            from: myPeerId,
            type: type,
            data: data
        }
    ));
};
