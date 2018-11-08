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

interface Matcher {
    [key: number]: RegExp;
}

let expressions: Matcher = {};
expressions[TokenType.TAG] = /^_[^\s]+(?=($|\s))/;
expressions[TokenType.COMMENT] = /^#.*($|\n)/;
expressions[TokenType.DATA] = /^DATA_[^\s]+(?=($|\s))/i;
expressions[TokenType.LOOP] = /^LOOP_(?=($|\s))/i;
expressions[TokenType.SAVE_END] = /^SAVE_(?=($|\s))/i;
expressions[TokenType.SAVE] = /^SAVE_[^\s]+(?=($|\s))/i;
expressions[TokenType.GLOBAL] = /^GLOBAL_(?=($|\s))/i;
expressions[TokenType.STOP] = /^STOP_(?=($|\s))/i;
expressions[TokenType.SINGLE] = /^'[^']*'/;
expressions[TokenType.DOUBLE] = /^"[^"]*"/;
expressions[TokenType.MULTILINE] = /^\n;((\n[^;])|.)*\n;/;
expressions[TokenType.NUMBER] = /^(\+|-)?(([0-9]+)|([0-9]*\.[0-9]+)|([0-9]+\.))((e|E)(\+|-)?[0-9]+)?(?=($|\s))/;
expressions[TokenType.DOT] = /^(\.)(?=($|\s))/;
expressions[TokenType.QUESTION] = /^(\?)(?=($|\s))/;
expressions[TokenType.UNQUOTED] = /^[^\s]+/;
expressions[TokenType.WHITESPACE] = /^[^\S\n]+/;
expressions[TokenType.NEWLINE] = /^\n/;
