import { parser } from './parser';
import { readFile } from 'fs';

export function dictionaries() {
    /*
    readFile('./server/dictionaries/cif_core_2.4.5.dic', 'utf8', function (err: NodeJS.ErrnoException, data: string) {
        if (err) {
            return console.log(err);
        }
        // console.log(data);
    });
    */
}

export function readRegister() {
    readFile('cifdic.register', 'utf8', function (err: NodeJS.ErrnoException, data: string) {
        if (err) {
            return console.log(err);
        }
        const tokens = parser(data);
        const nameToUrl = new Map();
        let name = "";
        tokens.forEach(token => {
            if (token.tag && token.tag.text === "_cifdic_dictionary.name") {
                name = token.text;
            }
            if (token.tag && token.tag.text === "_cifdic_dictionary.URL") {
                nameToUrl.set(name, token.text);
            }
        });
        nameToUrl.forEach((value) => {
            console.log("curl -O " + value);
        });
    });
}
