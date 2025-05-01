import * as assert from "assert";
import { parser } from "../parser";
import {
  formatParserError,
  ParserError,
  ParserErrorType,
} from "../parserErrors";

describe("parser - error handling", function () {
  it("should format error type names to human-readable text", function () {
    assert.strictEqual(
      formatParserError(new ParserError(ParserErrorType.DataIdentifierMissing)),
      "data identifier missing",
    );
  });
  it("should notice empty file", function () {
    const result = parser("");
    const errors = result.errors ?? [];
    assert.strictEqual(errors.length, 1);
    assert.strictEqual(errors[0].type, ParserErrorType.EmptyFile);
  });
  it("should notice file with only a comment", function () {
    const result = parser("# just a comment");
    const errors = result.errors ?? [];
    assert.strictEqual(errors.length, 1);
    assert.strictEqual(errors[0].type, ParserErrorType.EmptyFile);
  });
  it("should notice empty data block", function () {
    const result = parser("data_foo");
    const errors = result.errors ?? [];
    assert.strictEqual(errors.length, 1);
    assert.strictEqual(errors[0].type, ParserErrorType.EmptyDataBlock);
  });
  it("should notice missing value", function () {
    const result = parser("data_foo _a b _c _d e");
    const errors = result.errors ?? [];
    assert.strictEqual(errors.length, 1);
    assert.strictEqual(errors[0].type, ParserErrorType.ValueMissing);
  });
});
