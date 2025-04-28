import * as assert from "assert";
import { parser } from "../parser";
import { ParserErrorType } from "../parserErrors";

describe("parser - error handling", function () {
  it("should return EmptyFile error for empty input", function () {
    const result = parser("");
    const errors = result.errors ?? [];
    assert.strictEqual(errors.length, 1);
    assert.strictEqual(errors[0].type, ParserErrorType.EmptyFile);
  });
  it("should return EmptyFile error for input with only a comment", function () {
    const result = parser("# just a comment");
    const errors = result.errors ?? [];
    assert.strictEqual(errors.length, 1);
    assert.strictEqual(errors[0].type, ParserErrorType.EmptyFile);
  });
});
