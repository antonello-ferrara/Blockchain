/*
Parte6: Classe per la gestione del wallet
*/
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import elliptic from 'elliptic';

export class Wallet {

    publicAddress = "";
    ec;

    constructor(peerId) {

        this.publicAddress=peerId;
        let dirname = path.dirname(fileURLToPath(import.meta.url));
        let privateKeyLocation = `${dirname}/wallet/privatekey`;
        this.ec = new elliptic.ec('secp256k1');
        let privateKey;
        let publicKey;


        if (fs.existsSync(privateKeyLocation)) {
            let buffer = fs.readFileSync(privateKeyLocation, 'utf8');
            privateKey = buffer.toString();
            publicKey = this.ec.keyFromPrivate(privateKey).getPublic().encode('hex')
            console.log(`Chiave privata:${privateKey}`);
            console.log(`Chiave pubblica:${publicKey}`);
        }
        else {
            privateKey = this.generatePrivateKey();
            fs.writeFileSync(privateKeyLocation, privateKey);
            publicKey = this.ec.keyFromPrivate(privateKey).getPublic().encode('hex');
            console.log(`Chiave privata:${privateKey} generata in ${privateKeyLocation}`);
            console.log(`Chiave pubblica:${publicKey}`);
        }


    }

    generatePrivateKey() {

        let keyPair = this.ec.genKeyPair();
        return keyPair.getPrivate().toString('hex');

    };

}
