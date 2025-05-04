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
  it("should detect only duplicate data block errors", function () {
    const input = `
      data_block1
      _a a1
      data_block1
      _b b1
      data_block1
      _c c1
    `;
    const result = parser(input);
    const errors = result.errors ?? [];
    assert.strictEqual(errors.length, 3, "Expected exactly 3 errors");
    errors.forEach((error) =>
      assert.strictEqual(
        error.type,
        ParserErrorType.DuplicateData,
        "Expected only DuplicateDataBlock errors",
      ),
    );
  });
  it("should detect only duplicate tag errors", function () {
    const input = `
      data_block1
      _a a1
      _a a2
      _a a3
    `;
    const result = parser(input);
    const errors = result.errors ?? [];
    assert.strictEqual(errors.length, 3, "Expected exactly 3 errors");
    errors.forEach((error) =>
      assert.strictEqual(
        error.type,
        ParserErrorType.DuplicateTag,
        "Expected only DuplicateTag errors",
      ),
    );
  });
  it("should allow same tag name in different data blocks", function () {
    const input = `
      data_block1
      _a a1
      data_block2
      _a a2
    `;
    const result = parser(input);
    const errors = result.errors.filter(
      (e) => e.type === ParserErrorType.DuplicateTag,
    );
    assert.strictEqual(errors.length, 0);
  });
});
