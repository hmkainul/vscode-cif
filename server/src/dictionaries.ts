import { parser } from './parser';

export function dictionaries() {
    const fs = require('fs')
    fs.readFile('./server/dictionaries/cif_core_2.4.5.dic', 'utf8', function (err: NodeJS.ErrnoException, data: string) {
        if (err) {
            return console.log(err);
        }
        // console.log(data);
    });
}

export function readRegister() {
    const fs = require('fs')
    fs.readFile('cifdic.register', 'utf8', function (err: NodeJS.ErrnoException, data: string) {
        if (err) {
            return console.log(err);
        }
        const tokens = parser(data);
        let nameToUrl = new Map();
        let name = "";
        tokens.forEach(token => {
            if (token.tag && token.tag.text === "_cifdic_dictionary.name") {
                name = token.text;
            }
            if (token.tag && token.tag.text === "_cifdic_dictionary.URL") {
                nameToUrl.set(name, token.text);
            }
        });
        nameToUrl.forEach((value, _key) => {
            console.log("curl -O " + value);
        });
    });
}
