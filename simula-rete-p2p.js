/*

Programmazione Blockchain parte1
esempio rete p2p

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
    

const peers = {};//definiamo come costante per evitare che i rif dei nodi possano variare
let connSeq = 0;
let channel = 'BlockchainChannel';

const myPeerId = randomBytes(32);
console.log(`Nodo corrente: ${myPeerId.toString('hex')}`);

const config = defaults({
    id: myPeerId,
});

const swarm = Swarm(config);

/*
funzione asincrona che monitora gli eventi generari dall'istanza della classe swarm
*/
(async () => {
    const port = await getPort();

    swarm.listen(port);
    console.log(`Porta ${port} in ascolto`);

    swarm.join(channel);
    
    //evento che si genera in caso di connessione con un nodo
    swarm.on('connection', (conn, info) => {

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
            console.log('Contenuto del messaggio: ' + JSON.stringify(message.data));
            console.log('*** Fine Ricezione Messaggi ***');

        });

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

//invia un messaggio a tutti i nodi della rete ogni 5 sec
setInterval(function(){
    let date=new Date();
    writeMessageToPeers(`DataOra Peer ${myPeerId}`, date.toLocaleDateString()+" "+date.toLocaleTimeString());
}, 5000);


//invia un messaggio a tutti i nodi della rete
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

