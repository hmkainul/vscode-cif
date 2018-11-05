export enum TokenType {
    TAG,
    COMMENT,
    DATA,
    LOOP,
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
    WHITESPACE
}

export interface Token {
    type: TokenType;
    text: string;
    line: number;
    column: number;
}

export function lexer(sourceCode: string) {
    let code = sourceCode;
    let result = [];
    let line = 0;
    let column = 0;
    while (code.length > 0) {
        for (let entry in expressions) {
            var f = expressions[entry].exec(code);
            if (f) {
                let text = f[0];
                code = code.substring(text.length);
                result.push({
                    type: entry,
                    text,
                    line,
                    column
                });
                for (let c of text) {
                    if (c == '\n') {
                        line++;
                        column = 0;
                    } else {
                        column++;
                    }
                }
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
expressions[TokenType.SAVE] = /^SAVE_[^\s]*(?=($|\s))/i;
expressions[TokenType.GLOBAL] = /^GLOBAL_(?=($|\s))/i;
expressions[TokenType.STOP] = /^STOP_(?=($|\s))/i;
expressions[TokenType.SINGLE] = /^'[^']*'/;
expressions[TokenType.DOUBLE] = /^"[^"]*"/;
expressions[TokenType.MULTILINE] = /^\n;(\n|.)*\n;/;
expressions[TokenType.NUMBER] = /^(\+|-)?(([0-9]+)|([0-9]*\.[0-9]+)|([0-9]+\.))((e|E)(\+|-)?[0-9]+)?(?=($|\s))/;
expressions[TokenType.DOT] = /^(\.)(?=($|\s))/;
expressions[TokenType.QUESTION] = /^(\?)(?=($|\s))/;
expressions[TokenType.UNQUOTED] = /^[^\s]+/;
expressions[TokenType.WHITESPACE] = /^[\s]+/;
