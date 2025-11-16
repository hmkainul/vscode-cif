import { Range } from "vscode-languageserver";
import { ParserError } from "./parserErrors";

export interface ParserResult {
  tokens: Token[];
  errors: ParserError[];
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
  CIF2_TABLE_DELIMITER,
  CIF2_TABLE_END,
  UNQUOTED,
  WHITESPACE,
  NEWLINE,
}

export function isValue(token: Token): boolean {
  return (
    token && TokenType.SINGLE <= token.type && token.type <= TokenType.UNQUOTED
  );
}
