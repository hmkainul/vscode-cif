import * as assert from "assert";
import * as fs from "fs";
import * as path from "path";
import { parser } from "../parser/parser";
import { formatParserError } from "../parser/parserErrors";

const testRoot = path.resolve(__dirname, "../../../server/src/test/files");
const inputDir = path.join(testRoot, "input");
const expectedDir = path.join(testRoot, "expected");
const updateMode = false;

describe("trip tests", () => {
  const files = fs.readdirSync(inputDir);
  for (const cifFile of files) {
    const cifPath = path.join(inputDir, cifFile);
    const resultPath = path.join(expectedDir, `${cifFile}.result`);
    it(`should match output for ${cifFile}`, () => {
      const input = fs.readFileSync(cifPath, "utf-8");
      const result = parser(input);
      const actual = result.errors.map(formatParserError).join("\n").trim();
      if (updateMode) {
        fs.writeFileSync(resultPath, actual + "\n", "utf-8");
        console.log(`Updated: ${cifFile}.result`);
        return;
      } else {
        const expected = fs.readFileSync(resultPath, "utf-8").trim();
        assert.strictEqual(
          actual,
          expected,
          `Mismatch in ${cifFile}\n--- Expected ---\n${expected}\n--- Actual ---\n${actual}`,
        );
      }
    });
  }
});
