import { Range } from "vscode-languageserver";

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
  CIF2_TABLE_DELIMINITER,
  CIF2_TABLE_END,
  UNQUOTED,
  WHITESPACE,
  NEWLINE,
}
