import { lexer } from "./lexer";
import { isValue, ParserResult, Token } from "./token";
import { TokenType } from "./token";
import { ParserError, ParserErrorType } from "./parserErrors";
import { validateParsedData } from "./validation";

interface Data extends ParserResult {
  index: number;
  block?: Token;
  loop?: Token;
  save?: Token;
}

export function parser(sourceCode: string): ParserResult {
  try {
    return parseInternal(sourceCode);
  } catch (err) {
    return {
      tokens: [],
      errors: [
        new ParserError(ParserErrorType.FatalError, undefined, String(err)),
      ],
    };
  }
}

function parseInternal(sourceCode: string): ParserResult {
  let { tokens, errors } = lexer(sourceCode);
  tokens = tokens.filter(
    (t) => t.type !== TokenType.COMMENT && t.type < TokenType.WHITESPACE,
  );
  const data: Data = {
    tokens,
    index: 0,
    errors,
  };
  if (tokens.length === 0) {
    data.errors.push(new ParserError(ParserErrorType.EmptyFile));
  } else {
    while (dataBlock(data)) {
      // ...
    }
    validateParsedData(data);
  }
  return { tokens, errors: data.errors };
}

function dataBlock(data: Data): boolean {
  const block = next(data);
  if (block === null) {
    return false;
  }
  if (is(block, TokenType.DATA)) {
    let emptyDataBlock = true;
    data.block = block;
    while (dataItems(data) || saveFrame(data)) {
      emptyDataBlock = false;
    }
    if (emptyDataBlock) {
      data.errors.push(new ParserError(ParserErrorType.EmptyDataBlock, block));
    }
    data.block = null;
    return true;
  } else {
    data.errors.push(new ParserError(ParserErrorType.MissingDataBlock, block));
    return true;
  }
}

function dataItems(data: Data): boolean {
  if (tagAndValue(data)) {
    return true;
  } else if (loop(data)) {
    data.loop = null;
    return true;
  } else if (isValue(current(data))) {
    data.errors.push(
      new ParserError(ParserErrorType.UnexpectedValue, next(data)),
    );
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
      } else {
        data.errors.push(
          new ParserError(ParserErrorType.UnclosedSaveFrame, begin),
        );
        if (end !== null) {
          data.index = previousIndex;
        }
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
    if (value === null) {
      data.errors.push(new ParserError(ParserErrorType.ValueMissing, tag));
      return true;
    } else if (
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
    } else {
      data.index = previousIndex + 1;
      data.errors.push(new ParserError(ParserErrorType.ValueMissing, tag));
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
    const loop = token;
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
        let valueCount = 1;
        token.tag = tags[index++];
        token = next(data);
        while (isValue(token)) {
          valueCount++;
          if (tags.length <= index) {
            index = 0;
          }
          token.tag = tags[index++];
          token = next(data);
        }
        if (token) {
          data.index--;
        }
        if (valueCount % tags.length !== 0) {
          data.errors.push(
            new ParserError(ParserErrorType.LoopValueMismatch, loop),
          );
        }
        return true;
      } else {
        data.errors.push(
          new ParserError(ParserErrorType.LoopValuesMissing, loop),
        );
        if (token !== null) {
          data.index = previousIndex;
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

function current(data: Data): Token {
  if (data.index >= data.tokens.length) {
    return null;
  }
  return data.tokens[data.index];
}

function is(token: Token, type: TokenType): boolean {
  return token && token.type == type;
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
