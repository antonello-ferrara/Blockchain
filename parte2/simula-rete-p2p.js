/*

Programmazione Blockchain parte2
esempio rete p2p con scambio dei blocchi

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
import { MyBlockchain } from './my-blockchain.js';//Rif alla classe MyBlockchain Parte2

    

const peers = {};//definiamo come costante per evitare che i rif dei nodi possano variare
let connSeq = 0;
let channel = 'BlockchainChannel';
let myBlockchain=new MyBlockchain();



// Var dei tipi di messaggi scambiati tra i nodi (parte2)
let MessageType = {
    REQUEST_BLOCK: 'requestBlock',
    RECEIVE_NEXT_BLOCK: 'receiveNextBlock'
};

const myPeerId = randomBytes(32);
console.log(`Nodo corrente: ${myPeerId.toString('hex')}`);

const config = defaults({
    id: myPeerId,
});

const swarm = Swarm(config);

/*
funzione asincrona che monitora gli eventi generati dall'istanza della classe swarm
*/
(async () => {
    const port = await getPort();

    swarm.listen(port);
    console.log(`Porta ${port} in ascolto`);

    swarm.join(channel);

     //Aggiunto evento Part2
     swarm.on('connect-failed', function(peer, details) { 

        console.error(`!!! connect-failed !!!`);
        console.error(details);
        
      })

    //Evento che si genera in caso di connessione con un nodo
    swarm.on('connection', (conn, info) => {

        console.log(conn + " " +info);

        const seq = connSeq;
        const peerId = info.id.toString('hex');
        
        console.log(`Connessione #${seq} al nodo ${peerId}`);
        

        conn.on('data', data => {
            let message = JSON.parse(data);
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
                    else
                        console.warn(`Blocco con indice ${requestedIndex} non trovato!`);
                    
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
            }

        });//end switch

        conn.on('close', () => {
            console.log(`Connessione #${seq} chiusa verso il nodo: ${peerId}`);
            if (peers[peerId].seq === seq) {
                delete peers[peerId]
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
setInterval(function(){
    let idx=myBlockchain.getLatestBlock().index;
    writeMessageToPeers(MessageType.REQUEST_BLOCK, {index: idx});
}, 5000);


//invia un messaggio a tutti i nodi della rete Parte2
function writeMessageToPeers (type, data)  {
    
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
function writeMessageToPeerToId  (toId, type, data) {
    for (let id in peers) {
        if (id === toId) {
            console.log('*** Inizio scrittura messaggio al nodo della rete ***');
            console.log(`Tipo Messaggio ${type} Nodo Id ${toId}`);
            console.log('*** Fine scrittura messaggio al nodo della rete *** ');
            sendMessage(id, type, data);
        }
    }
};


function sendMessage (id, type, data) {
    peers[id].conn.write(JSON.stringify(
        {
            to: id,
            from: myPeerId,
            type: type,
            data: data
        }
    ));
};

