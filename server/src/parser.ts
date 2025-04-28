import { Token, TokenType, lexer } from "./lexer";
import { ParserError, ParserErrorType } from "./parserErrors";

interface Data {
  tokens: Token[];
  index: number;
  block?: Token;
  loop?: Token;
  save?: Token;
  errors: ParserError[];
}

export interface ParserResult {
  tokens: Token[];
  errors: ParserError[];
}

export function parser(sourceCode: string): ParserResult {
  let tokens = lexer(sourceCode);
  tokens = tokens.filter(
    (t) => t.type !== TokenType.COMMENT && t.type < TokenType.WHITESPACE,
  );
  const data: Data = {
    tokens,
    index: 0,
    errors: [],
  };
  if (tokens.length === 0) {
    data.errors.push(new ParserError(ParserErrorType.EmptyFile));
  } else {
    while (dataBlock(data)) {
      // ...
    }
  }
  return { tokens, errors: data.errors };
}

function dataBlock(data: Data): boolean {
  const block = next(data);
  if (is(block, TokenType.DATA)) {
    data.block = block;
    while (dataItems(data) || saveFrame(data)) {
      // ...
    }
    data.block = null;
    return true;
  }
  return false;
}

function dataItems(data: Data): boolean {
  if (tagAndValue(data)) {
    return true;
  } else if (loop(data)) {
    data.loop = null;
    return true;
  } else {
    return false;
  }
}

function saveFrame(data: Data): boolean {
  const previousIndex = data.index;
  const begin = next(data);
  if (is(begin, TokenType.SAVE)) {
    data.save = begin;
    if (dataItems(data)) {
      while (dataItems(data)) {
        // ...
      }
      const end = next(data);
      if (is(end, TokenType.SAVE_END)) {
        data.save = null;
        return true;
      }
    }
  }
  data.index = previousIndex;
  return false;
}

function tagAndValue(data: Data): boolean {
  const previousIndex = data.index;
  const tag = next(data);
  if (is(tag, TokenType.TAG)) {
    const value = next(data);
    if (
      handleCif2Collection(
        TokenType.CIF2_LIST_START,
        TokenType.CIF2_LIST_END,
        value.type,
        data,
        tag,
      )
    ) {
      return true;
    } else if (
      handleCif2Collection(
        TokenType.CIF2_TABLE_START,
        TokenType.CIF2_TABLE_END,
        value.type,
        data,
        tag,
      )
    ) {
      return true;
    } else if (isValue(value)) {
      value.tag = tag;
      return true;
    }
  }
  data.index = previousIndex;
  return false;
}

function loop(data: Data): boolean {
  const previousIndex = data.index;
  let token = next(data);
  const tags: Token[] = [];
  if (is(token, TokenType.LOOP)) {
    token.loop = null;
    data.loop = token;
    token = next(data);
    if (is(token, TokenType.TAG)) {
      tags.push(token);
      token = next(data);
      while (is(token, TokenType.TAG)) {
        tags.push(token);
        token = next(data);
      }
      if (isValue(token)) {
        let index = 0;
        token.tag = tags[index++];
        token = next(data);
        while (isValue(token)) {
          if (tags.length <= index) {
            index = 0;
          }
          token.tag = tags[index++];
          token = next(data);
        }
        if (token) {
          data.index--;
        }
        return true;
      }
    }
  }
  data.index = previousIndex;
  return false;
}

function next(data: Data): Token {
  if (data.index >= data.tokens.length) {
    return null;
  }
  const result = data.tokens[data.index++];
  result.block = data.block;
  result.loop = data.loop;
  result.save = data.save;
  return result;
}

function is(token: Token, type: TokenType): boolean {
  return token && token.type == type;
}

function isValue(token: Token): boolean {
  return (
    token && TokenType.SINGLE <= token.type && token.type <= TokenType.UNQUOTED
  );
}

function handleCif2Collection(
  start: TokenType,
  end: TokenType,
  type: TokenType,
  data: Data,
  tag: Token,
) {
  if (type === start) {
    let i = 0;
    for (;;) {
      const value = next(data);
      if (value === null) {
        break;
      }
      value.tag = tag;
      if (value.type === end) {
        if (i === 0) {
          return true;
        } else {
          i--;
        }
      } else if (value.type === start) {
        i++;
      }
    }
  }
  return false;
}
