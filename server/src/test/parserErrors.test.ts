import * as assert from "assert";
import { parser } from "../parser/parser";
import {
  formatParserError,
  ParserError,
  ParserErrorType,
} from "../parser/parserErrors";

function expectSingleError(
  input: string,
  expectedType: ParserErrorType,
  text: string = "",
) {
  const result = parser(input);
  const errors = result.errors ?? [];
  assert.strictEqual(
    errors.length,
    1,
    errors.map((x) => formatParserError(x)).join(),
  );
  assert.strictEqual(errors[0].type, expectedType);
  assert.strictEqual(errors[0].token?.text ?? "", text);
}

describe("parser - error handling", function () {
  it("should format error type names to human-readable text", function () {
    assert.strictEqual(
      formatParserError(new ParserError(ParserErrorType.DataIdentifierMissing)),
      "data identifier missing ",
    );
  });
  it("should notice empty file", function () {
    expectSingleError("", ParserErrorType.EmptyFile);
  });
  it("should notice file with only a comment", function () {
    expectSingleError("# just a comment", ParserErrorType.EmptyFile);
  });
  it("should notice empty data block", function () {
    expectSingleError("data_foo", ParserErrorType.EmptyDataBlock, "data_foo");
  });
  it("should notice missing value", function () {
    expectSingleError(
      "data_foo _a b _c _d e",
      ParserErrorType.ValueMissing,
      "_c",
    );
  });
  it("should report value without tag at the end", function () {
    expectSingleError(
      "data_foo _a b _c d e",
      ParserErrorType.UnexpectedValue,
      "e",
    );
  });
  it("should report value without tag in the middle", function () {
    expectSingleError(
      "data_foo _a b c _d e",
      ParserErrorType.UnexpectedValue,
      "c",
    );
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
    errors.forEach((error) => {
      assert.strictEqual(
        error.type,
        ParserErrorType.DuplicateData,
        "Expected only DuplicateDataBlock errors",
      );
      assert.strictEqual(error.token?.text, "data_block1");
    });
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
    errors.forEach((error) => {
      assert.strictEqual(
        error.type,
        ParserErrorType.DuplicateTag,
        "Expected only DuplicateTag errors",
      );
      assert.strictEqual(error.token?.text, "_a");
    });
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
