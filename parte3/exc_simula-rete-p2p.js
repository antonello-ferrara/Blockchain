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
import { Miner } from './miner.js';



const peers = {};//definiamo come costante per evitare che i rif dei nodi possano variare
let connSeq = 0;
let channel = 'BlockchainChannel';
let myBlockchain = new MyBlockchain();
let miner = new Miner();


//Parte2: Var dei tipi di messaggi scambiati tra i nodi 
let MessageType = {
    REQUEST_BLOCK: 'requestBlock',
    RECEIVE_NEXT_BLOCK: 'receiveNextBlock',
    REQUEST_ALL_REGISTER_MINERS: 'requestAllRegisterMiners',//Parte3
    REGISTER_MINER: 'registerMiner'//Parte3
};

const myPeerId = randomBytes(32);
console.log(`Nodo corrente: ${myPeerId.toString('hex')}`);
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
        
            try{
                message = JSON.parse(data);
            }
            catch(e){
                console.log("on data error:"+data);
                return;
            }
           
            
            
            /*
            console.log('*** Avvio Ricezione Messaggi ***');
            console.log('Dal nodo: ' + peerId.toString('hex'));
            console.log('Al nodo: ' + peerId.toString(message.to));
            console.log('Nodo corrente: ' + myPeerId.toString('hex'));
            console.log('Tipo messaggio: ' + JSON.stringify(message.type));
            console.log('*** Fine Ricezione Messaggi ***');
            */

            //Parte2: aggiunto switch del tipo di messaggio ricevuto 
            switch (message.type) {
                case MessageType.REQUEST_BLOCK:
                    //Parte2:Riceve da un nodo la richiesta di trasmissione del blocco con indice contenuto nel messaggio
                    
                    console.log('*** Richiesta blocco INZIO ***');
                    let requestedIndex = (JSON.parse(JSON.stringify(message.data))).index;
                    let requestedBlock = myBlockchain.getBlock(requestedIndex);

                    if (requestedBlock)
                        writeMessageToPeerToId(peerId.toString('hex'), MessageType.RECEIVE_NEXT_BLOCK, requestedBlock);
                    else
                        console.warn(`Blocco con indice ${requestedIndex} non trovato!`);

                    console.log('*** Richiesta blocco FINE ***');
                    break;

                case MessageType.RECEIVE_NEXT_BLOCK:

                    //Parte2:Chiede il blocco successivo ai nodi della rete
                    //console.log('*** Ricezione blocco INZIO ***');
                    myBlockchain.addBlock(JSON.parse(JSON.stringify(message.data)));
                    //console.log(JSON.stringify(myBlockchain.blockchain));
                    let nextBlockIndex = myBlockchain.getLatestBlock().index + 1;
                    writeMessageToPeers(MessageType.REQUEST_BLOCK, { index: nextBlockIndex });
                    //console.log('*** Ricezione blocco FINE ***');

                    break;

                /* Parte 3 INIZIO */
               
                case MessageType.REQUEST_ALL_REGISTER_MINERS:

                    console.log('*** Trasmette i nodi miners ***' + message.to);
                    writeMessageToPeers(MessageType.REGISTER_MINER, miner.registeredMiners);
                    //miner.register( JSON.parse(JSON.stringify(message.data)) );
                    

                    break;
                case MessageType.REGISTER_MINER:

                    console.log('*** Registrazione dei nodi miners ***' + message.to);
                    let miners = JSON.stringify(message.data);
                    miner.register( JSON.parse(miners) );
                    
                    break;
                /* Parte 3 FINE */
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

    let idx = myBlockchain.getLatestBlock().index;
    writeMessageToPeers(MessageType.REQUEST_BLOCK, { index: idx });
    
}, 5000);

//Parte3:funzione eseguita una volta sola dopo 5sec che chiede i miners agli nodi
// setInterval(function () {

//     console.log('***  Richiesta nodi miners ***')
//     writeMessageToPeers(MessageType.REQUEST_ALL_REGISTER_MINERS, null);

// }, 7000);

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

