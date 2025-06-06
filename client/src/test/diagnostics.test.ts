"use strict";

import * as vscode from "vscode";
import * as assert from "assert";
import { activateExtension } from "./activator";

suite("Should get diagnostics", () => {
  test("Diagnoses _tags not found in dictionaries", async () => {
    await testDiagnostics([
      {
        message:
          "Non-standard data name warnings are enabled. You can disable them in Settings > CIF: Show warnings for non-standard data names",
        range: toRange(1, 0, 1, 3),
        severity: vscode.DiagnosticSeverity.Information,
        source: "cif",
      },
      {
        message: "'_aa' is a non-standard data name.",
        range: toRange(1, 0, 1, 3),
        severity: vscode.DiagnosticSeverity.Warning,
        source: "cif",
      },
      {
        message: "'_bb' is a non-standard data name.",
        range: toRange(2, 0, 2, 3),
        severity: vscode.DiagnosticSeverity.Warning,
        source: "cif",
      },
    ]);
  });
});

async function testDiagnostics(expectedDiagnostics: vscode.Diagnostic[]) {
  const docUri = await activateExtension("diagnostics.cif");
  const actualDiagnostics = vscode.languages.getDiagnostics(docUri);
  assert.equal(actualDiagnostics.length, expectedDiagnostics.length);
  expectedDiagnostics.forEach((expectedDiagnostic, i) => {
    const actualDiagnostic = actualDiagnostics[i];
    assert.equal(actualDiagnostic.message, expectedDiagnostic.message);
    assert.deepEqual(actualDiagnostic.range, expectedDiagnostic.range);
    assert.equal(actualDiagnostic.severity, expectedDiagnostic.severity);
  });
}

function toRange(sLine: number, sChar: number, eLine: number, eChar: number) {
  const start = new vscode.Position(sLine, sChar);
  const end = new vscode.Position(eLine, eChar);
  return new vscode.Range(start, end);
}
