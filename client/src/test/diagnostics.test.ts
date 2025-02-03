"use strict";

import * as vscode from "vscode";
import * as assert from "assert";
import { activateExtension } from "./activator";

suite("Should get diagnostics", () => {
  test("Diagnoses _tags not found in dictionaries", async () => {
    await testDiagnostics([
      {
        message: "'_aa' is a non-standard data name.",
        range: toRange(0, 0, 0, 3),
        severity: vscode.DiagnosticSeverity.Warning,
        source: "cif",
      },
      {
        message: "'_aa' is a non-standard data name.",
        range: toRange(0, 14, 0, 17),
        severity: vscode.DiagnosticSeverity.Warning,
        source: "cif",
      },
      {
        message: "'_b' is a non-standard data name.",
        range: toRange(0, 18, 0, 20),
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
