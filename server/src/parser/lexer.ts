import { Range, Position } from "vscode-languageserver";
import { ParserResult, TokenType } from "./token";
import { validateTextContent, validateTokens } from "./validation";

interface LexerResult extends ParserResult {
  tableCount: number;
}

export function lexer(sourceCode: string): ParserResult {
  const isCif2 = sourceCode.startsWith("#\\#CIF_2.0");
  const expressions = selectRegexMap(isCif2);
  sourceCode = normalizeLineBreaks(sourceCode);
  const result: LexerResult = {
    tokens: [],
    errors: [],
    tableCount: 0,
  };
  if (!isCif2) {
    validateTextContent(sourceCode, result);
  }
  const position = Position.create(0, 0);
  while (sourceCode.length > 0) {
    sourceCode = findNextToken(expressions, sourceCode, position, result);
  }
  validateTokens(result);
  return {
    tokens: result.tokens,
    errors: result.errors,
  };
}

function normalizeLineBreaks(text: string): string {
  return text.replace(/\r\n/g, "\n");
}

function findNextToken(
  expressions: Map<TokenType, RegExp>,
  sourceCode: string,
  position: Position,
  result: LexerResult,
): string {
  for (const [tokenType, tokenRegex] of expressions) {
    const searchResult = tokenRegex.exec(sourceCode);
    if (searchResult) {
      switch (tokenType) {
        case TokenType.CIF2_TABLE_START:
          result.tableCount++;
          break;
        case TokenType.CIF2_TABLE_END:
          result.tableCount--;
          break;
        case TokenType.CIF2_TABLE_DELIMITER:
          if (!result.tableCount) {
            continue;
          }
          break;
      }
      const tokenText = searchResult[0];
      result.tokens.push({
        type: tokenType,
        text: tokenText,
        range: tokenRange(tokenText, position),
      });
      return sourceCode.substring(tokenText.length);
    }
  }
  throw new Error(
    `Lexer failed at line ${position.line}, col ${position.character}`,
  );
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

type TokenRegex = RegExp | [undefined, RegExp] | [RegExp, RegExp];

const cifExpressions = new Map<TokenType, TokenRegex>([
  [TokenType.TAG, /^_[^\s]+(?=($|\s))/],
  [TokenType.COMMENT, /^#.*(?=($|\n))/],
  [TokenType.DATA, /^DATA_[^\s]+(?=($|\s))/i],
  [TokenType.LOOP, /^LOOP_(?=($|\s))/i],
  [TokenType.SAVE_END, /^SAVE_(?=($|\s))/i],
  [TokenType.SAVE, /^SAVE_[^\s]+(?=($|\s))/i],
  [TokenType.GLOBAL, /^GLOBAL_(?=($|\s))/i],
  [TokenType.STOP, /^STOP_(?=($|\s))/i],
  [TokenType.CIF2_TRIPLE, [undefined, /^'''(?!''').*'''/]],
  [TokenType.SINGLE, [/^'(?:[^'\n]|'(?!\s|$))*'(?!\S)/, /^'[^'\n]*'/]],
  [TokenType.DOUBLE, [/^"(?:[^"\n]|"(?!\s|$))*"(?!\S)/, /^"[^"\n]*"/]],
  [TokenType.MULTILINE, /^\n;(\n|.)*?\n;/],
  [
    TokenType.NUMBER,
    /^([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)(\(\d+\))?(?=($|[\s]))/,
  ],
  [TokenType.DOT, /^(\.)(?=($|\s))/],
  [TokenType.QUESTION, /^(\?)(?=($|\s))/],
  [TokenType.CIF2_LIST_START, [undefined, /^\[/]],
  [TokenType.CIF2_LIST_END, [undefined, /^\](?=($|\s))/i]],
  [TokenType.CIF2_TABLE_START, [undefined, /^{/]],
  [TokenType.CIF2_TABLE_DELIMITER, [undefined, /^:/]],
  [TokenType.CIF2_TABLE_END, [undefined, /^}/]],
  [TokenType.UNQUOTED, [/^[^\s]+/, /^[^\s\]}]+/]],
  [TokenType.WHITESPACE, /^[^\S\n]+/],
  [TokenType.NEWLINE, /^\n/],
]);

function selectRegexMap(isCif2: boolean): Map<TokenType, RegExp> {
  const result = new Map<TokenType, RegExp>();
  for (const [tokenType, tokenRegex] of cifExpressions) {
    const selected =
      tokenRegex instanceof RegExp ? tokenRegex : tokenRegex[isCif2 ? 1 : 0];
    if (selected) {
      result.set(tokenType, selected);
    }
  }
  return result;
}
