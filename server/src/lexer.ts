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
  CIF2_TRIPLE,
  SINGLE,
  DOUBLE,
  MULTILINE,
  NUMBER,
  DOT,
  QUESTION,
  CIF2_LIST_START,
  CIF2_LIST_END,
  CIF2_TABLE_START,
  CIF2_TABLE_DELIMINITER,
  CIF2_TABLE_END,
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
  save?: Token;
}

interface LexerResult {
  tokens: Token[];
  tableCount: number;
}

export function lexer(sourceCode: string): Token[] {
  const expressions = sourceCode.startsWith("#\\#CIF_2.0")
    ? cif2Expressions
    : cif1Expressions;
  sourceCode = normalizeLineBreaks(sourceCode);
  const result: LexerResult = {
    tokens: [],
    tableCount: 0,
  };
  const position = Position.create(0, 0);
  while (sourceCode.length > 0) {
    sourceCode = findNextToken(expressions, sourceCode, position, result);
  }
  return result.tokens;
}

function normalizeLineBreaks(text: string): string {
  return text.replace(/\r\n/g, "\n");
}

function findNextToken(
  expressions: { [key: number]: RegExp },
  sourceCode: string,
  position: Position,
  result: LexerResult,
): string {
  for (const type in expressions) {
    const searchResult = expressions[type].exec(sourceCode);
    if (searchResult) {
      switch (+type) {
        case TokenType.CIF2_TABLE_START:
          result.tableCount++;
          break;
        case TokenType.CIF2_TABLE_END:
          result.tableCount--;
          break;
        case TokenType.CIF2_TABLE_DELIMINITER:
          if (!result.tableCount) {
            continue;
          }
          break;
      }
      const tokenText = searchResult[0];
      result.tokens.push({
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

const cif1Expressions: { [key: number]: RegExp } = {
  [TokenType.TAG]: /^_[^\s]+(?=($|\s))/,
  [TokenType.COMMENT]: /^#.*(?=($|\n))/,
  [TokenType.DATA]: /^DATA_[^\s]+(?=($|\s))/i,
  [TokenType.LOOP]: /^LOOP_(?=($|\s))/i,
  [TokenType.SAVE_END]: /^SAVE_(?=($|\s))/i,
  [TokenType.SAVE]: /^SAVE_[^\s]+(?=($|\s))/i,
  [TokenType.GLOBAL]: /^GLOBAL_(?=($|\s))/i,
  [TokenType.STOP]: /^STOP_(?=($|\s))/i,
  [TokenType.SINGLE]: /^'.*'(?=($|\s))/,
  [TokenType.DOUBLE]: /^".*"(?=($|\s))/,
  [TokenType.MULTILINE]: /^\n;(\n|.)*?\n;/,
  [TokenType.NUMBER]:
    /^([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)(\(\d+\))?(?=($|[\s]))/,
  [TokenType.DOT]: /^(\.)(?=($|\s))/,
  [TokenType.QUESTION]: /^(\?)(?=($|\s))/,
  [TokenType.UNQUOTED]: /^[^\s]+/,
  [TokenType.WHITESPACE]: /^[^\S\n]+/,
  [TokenType.NEWLINE]: /^\n/,
};

const cif2Expressions: { [key: number]: RegExp } = {
  [TokenType.TAG]: /^_[^\s]+(?=($|\s))/,
  [TokenType.COMMENT]: /^#.*(?=($|\n))/,
  [TokenType.DATA]: /^DATA_[^\s]+(?=($|\s))/i,
  [TokenType.LOOP]: /^LOOP_(?=($|\s))/i,
  [TokenType.SAVE_END]: /^SAVE_(?=($|\s))/i,
  [TokenType.SAVE]: /^SAVE_[^\s]+(?=($|\s))/i,
  [TokenType.GLOBAL]: /^GLOBAL_(?=($|\s))/i,
  [TokenType.STOP]: /^STOP_(?=($|\s))/i,
  [TokenType.CIF2_TRIPLE]: /^'''(?!''').*'''/,
  [TokenType.SINGLE]: /^'[^']*'/,
  [TokenType.DOUBLE]: /^"[^"]*"/,
  [TokenType.MULTILINE]: /^\n;(\n|.)*?\n;/,
  [TokenType.NUMBER]:
    /^([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)(\(\d+\))?(?=($|[\s]))/,
  [TokenType.DOT]: /^(\.)(?=($|\s))/,
  [TokenType.QUESTION]: /^(\?)(?=($|\s))/,
  [TokenType.CIF2_LIST_START]: /^\[/,
  [TokenType.CIF2_LIST_END]: /^\](?=($|\s))/i,
  [TokenType.CIF2_TABLE_START]: /^{/,
  [TokenType.CIF2_TABLE_DELIMINITER]: /^:/,
  [TokenType.CIF2_TABLE_END]: /^}/,
  [TokenType.UNQUOTED]: /^[^\s\]}]+/,
  [TokenType.WHITESPACE]: /^[^\S\n]+/,
  [TokenType.NEWLINE]: /^\n/,
};
