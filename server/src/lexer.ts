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
  NEWLINE,
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
  sourceCode = normalizeLineBreaks(sourceCode);
  const result: Token[] = [];
  const position = Position.create(0, 0);
  while (sourceCode.length > 0) {
    sourceCode = findNextToken(sourceCode, position, result);
  }
  return result;
}

function normalizeLineBreaks(text: string): string {
  return text.replace(/\r\n/g, "\n");
}

function findNextToken(
  sourceCode: string,
  position: Position,
  result: Token[],
): string {
  for (const type in expressions) {
    const searchResult = expressions[type].exec(sourceCode);
    if (searchResult) {
      const tokenText = searchResult[0];
      result.push({
        type: +type,
        text: tokenText,
        range: tokenRange(tokenText, position),
      });
      return sourceCode.substring(tokenText.length);
    }
  }
  throw "Lexer failed!";
}

function tokenRange(tokenText: string, position: Position): Range {
  const start = clone(position);
  const lineBreaks = tokenText.match(/\n/g);
  position.line += lineBreaks ? lineBreaks.length : 0;
  position.character = lineBreaks
    ? tokenText.length - tokenText.lastIndexOf("\n") - 1
    : position.character + tokenText.length;
  return {
    start,
    end: clone(position),
  };
}

function clone(position: Position): Position {
  return Position.create(position.line, position.character);
}

const expressions: { [key: number]: RegExp } = {
  [TokenType.TAG]: /^_[^\s]+(?=($|\s))/,
  [TokenType.COMMENT]: /^#.*(?=($|\n))/,
  [TokenType.DATA]: /^DATA_[^\s]+(?=($|\s))/i,
  [TokenType.LOOP]: /^LOOP_(?=($|\s))/i,
  [TokenType.SAVE_END]: /^SAVE_(?=($|\s))/i,
  [TokenType.SAVE]: /^SAVE_[^\s]+(?=($|\s))/i,
  [TokenType.GLOBAL]: /^GLOBAL_(?=($|\s))/i,
  [TokenType.STOP]: /^STOP_(?=($|\s))/i,
  [TokenType.SINGLE]: /^'.*'(?=($|\s))/,
  [TokenType.DOUBLE]: /^"[^"]*"/,
  [TokenType.MULTILINE]: /^\n;(\n|.)*?\n;/,
  [TokenType.NUMBER]:
    /^(\+|-)?(([0-9]+)|([0-9]*\.[0-9]+)|([0-9]+\.))((e|E)(\+|-)?[0-9]+)?(?=($|\s))/,
  [TokenType.DOT]: /^(\.)(?=($|\s))/,
  [TokenType.QUESTION]: /^(\?)(?=($|\s))/,
  [TokenType.UNQUOTED]: /^[^\s]+/,
  [TokenType.WHITESPACE]: /^[^\S\n]+/,
  [TokenType.NEWLINE]: /^\n/,
};
