import { parser } from "./parser/parser";
import { readFile } from "fs";

export function readRegister() {
  readFile(
    "cifdic.register",
    "utf8",
    function (err: NodeJS.ErrnoException, data: string) {
      if (err) {
        return console.log(err);
      }
      const tokens = parser(data).tokens;
      const nameToUrl = new Map();
      let name = "";
      tokens.forEach((token) => {
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
    },
  );
}
