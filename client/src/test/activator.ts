"use strict";

import * as vscode from "vscode";
import * as path from "path";

export async function activateExtension(fileName: string): Promise<vscode.Uri> {
  const extension = vscode.extensions.getExtension("thisperiodictable.cif");
  await extension.activate();
  const doc = await vscode.workspace.openTextDocument(getDocUri(fileName));
  await vscode.window.showTextDocument(doc);
  await waitForServerActivation();
  return doc.uri;
}

async function waitForServerActivation() {
  return new Promise((resolve) => setTimeout(resolve, 2000));
}

function getDocUri(p: string) {
  const docPath = path.resolve(__dirname, "../../testFixture", p);
  return vscode.Uri.file(docPath);
}
