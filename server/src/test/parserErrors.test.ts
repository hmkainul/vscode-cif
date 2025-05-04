import * as assert from "assert";
import { parser } from "../parser/parser";
import {
  formatParserError,
  ParserError,
  ParserErrorType,
} from "../parser/parserErrors";

function expectSingleError(input: string, expectedType: ParserErrorType) {
  const result = parser(input);
  const errors = result.errors ?? [];
  assert.strictEqual(errors.length, 1);
  assert.strictEqual(errors[0].type, expectedType);
}

describe("parser - error handling", function () {
  it("should format error type names to human-readable text", function () {
    assert.strictEqual(
      formatParserError(new ParserError(ParserErrorType.DataIdentifierMissing)),
      "data identifier missing",
    );
  });
  it("should notice empty file", function () {
    expectSingleError("", ParserErrorType.EmptyFile);
  });

  it("should notice file with only a comment", function () {
    expectSingleError("# just a comment", ParserErrorType.EmptyFile);
  });

  it("should notice empty data block", function () {
    expectSingleError("data_foo", ParserErrorType.EmptyDataBlock);
  });

  it("should notice missing value", function () {
    expectSingleError("data_foo _a b _c _d e", ParserErrorType.ValueMissing);
  });
});
