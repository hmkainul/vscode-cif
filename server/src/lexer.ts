import { Range } from "vscode-languageserver";

export enum TokenType {
    TAG,
    COMMENT,
    DATA,
    LOOP,
    SAVE_END,
    SAVE,
    GLOBAL,
    STOP,
    SINGLE,
    DOUBLE,
    MULTILINE,
    NUMBER,
    DOT,
    QUESTION,
    UNQUOTED,
    WHITESPACE,
    NEWLINE
}

export interface Token {
    type: TokenType;
    text: string;
    range: Range;
    block?: Token;
    loop?: Token;
    tag?: Token;
}

export function lexer(sourceCode: string): Token[] {
    let code = sourceCode;
    let result: Token[] = [];
    let line = 0;
    let character = 0;
    while (code.length > 0) {
        for (let entry in expressions) {
            var f = expressions[entry].exec(code);
            if (f) {
                let text = f[0];
                code = code.substring(text.length);
                let start = {
                    line,
                    character
                };
                [...text].forEach((c) => {
                    if (c === '\n') {
                        line++;
                        character = 0;
                    } else {
                        character++;
                    }
                });
                result.push({
                    type: +entry,
                    text,
                    range: {
                        start,
                        end: {
                            line,
                            character
                        }
                    }
                });
                break;
            }
        }
    }
    return result;
}

let expressions: { [key: number]: RegExp } = {
    [TokenType.TAG]: /^_[^\s]+(?=($|\s))/,
    [TokenType.COMMENT]: /^#.*($|\n)/,
    [TokenType.DATA]: /^DATA_[^\s]+(?=($|\s))/i,
    [TokenType.LOOP]: /^LOOP_(?=($|\s))/i,
    [TokenType.SAVE_END]: /^SAVE_(?=($|\s))/i,
    [TokenType.SAVE]: /^SAVE_[^\s]+(?=($|\s))/i,
    [TokenType.GLOBAL]: /^GLOBAL_(?=($|\s))/i,
    [TokenType.STOP]: /^STOP_(?=($|\s))/i,
    [TokenType.SINGLE]: /^'[^']*'/,
    [TokenType.DOUBLE]: /^"[^"]*"/,
    [TokenType.MULTILINE]: /^\n;((\n[^;])|.)*\n;/,
    [TokenType.NUMBER]: /^(\+|-)?(([0-9]+)|([0-9]*\.[0-9]+)|([0-9]+\.))((e|E)(\+|-)?[0-9]+)?(?=($|\s))/,
    [TokenType.DOT]: /^(\.)(?=($|\s))/,
    [TokenType.QUESTION]: /^(\?)(?=($|\s))/,
    [TokenType.UNQUOTED]: /^[^\s]+/,
    [TokenType.WHITESPACE]: /^[^\S\n]+/,
    [TokenType.NEWLINE]: /^\n/
};
