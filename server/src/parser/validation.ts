import { Token, TokenType } from "./token";
import { ParserError, ParserErrorType } from "./parserErrors";
import type { ParserResult } from "./parser";

export function validateParsedData(data: ParserResult): void {
  checkDuplicateDataBlocks(data);
  checkDuplicateTagsInBlocks(data);
}

function checkDuplicateDataBlocks(data: ParserResult): void {
  const seen = new Map<string, Token>();
  const alreadyReported = new Set<Token>();
  for (const token of data.tokens) {
    if (token.type === TokenType.DATA) {
      const name = token.text;
      const existing = seen.get(name);
      if (existing) {
        if (!alreadyReported.has(existing)) {
          data.errors.push(
            new ParserError(ParserErrorType.DuplicateData, existing),
          );
          alreadyReported.add(existing);
        }
        data.errors.push(new ParserError(ParserErrorType.DuplicateData, token));
      } else {
        seen.set(name, token);
      }
    }
  }
}

function checkDuplicateTagsInBlocks(data: ParserResult): void {
  const tagsByBlock = new Map<string, Map<string, Token>>();
  const alreadyReported = new Set<Token>();
  for (const token of data.tokens) {
    if (token.type === TokenType.TAG && token.block?.text) {
      const blockName = token.block.text;
      const tagName = token.text;
      if (!tagsByBlock.has(blockName)) {
        tagsByBlock.set(blockName, new Map());
      }
      const tagMap = tagsByBlock.get(blockName)!;
      const existing = tagMap.get(tagName);
      if (existing) {
        if (!alreadyReported.has(existing)) {
          data.errors.push(
            new ParserError(ParserErrorType.DuplicateTag, existing),
          );
          alreadyReported.add(existing);
        }
        data.errors.push(new ParserError(ParserErrorType.DuplicateTag, token));
      } else {
        tagMap.set(tagName, token);
      }
    }
  }
}
