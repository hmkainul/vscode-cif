import { Range, Position } from "vscode-languageserver";

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
    let result: Token[] = []
    let position = Position.create(0, 0);
    while (sourceCode.length > 0) {
        sourceCode = findNextToken(sourceCode, position, result);
    }
    return result;
}

function findNextToken(sourceCode: string, position: Position, result: Token[]): string {
    for (let type in expressions) {
        let searchResult = expressions[type].exec(sourceCode);
        if (searchResult) {
            let tokenText = searchResult[0];
            result.push({
                type: +type,
                text: tokenText,
                range: tokenRange(tokenText, position)
            });
            return sourceCode.substring(tokenText.length);
        }
    }
    throw 'Lexer failed!';
}

function tokenRange(tokenText: string, position: Position): Range {
    let start = clone(position);
    let lineBreaks = tokenText.match(/\n/g);
    position.line += lineBreaks ? lineBreaks.length : 0;
    position.character = lineBreaks
        ? tokenText.length - tokenText.lastIndexOf('\n') - 1
        : position.character + tokenText.length;
    return {
        start,
        end: clone(position)
    };
}

function clone(position: Position): Position {
    return Position.create(position.line, position.character);
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
