import * as vscode from "vscode";
import * as fs from "fs/promises";
import { LanguageClient } from "vscode-languageclient/node";

export async function addCifDictionary(
  uri: vscode.Uri,
  context: vscode.ExtensionContext,
  client: LanguageClient,
) {
  if (!uri) {
    const selected = await vscode.window.showOpenDialog({
      canSelectMany: false,
      filters: { "CIF Dictionary": ["dic"] },
    });
    if (!selected || selected.length === 0) return;
    uri = selected[0];
  }
  const filePath = uri.fsPath;
  const stored = context.globalState.get<string[]>("cifDictionaries") || [];
  const exists = stored.includes(filePath);
  if (exists) {
    const choice = await vscode.window.showWarningMessage(
      `"${filePath}" already added. Overwrite?`,
      { modal: true },
      "Overwrite",
      "Cancel",
    );
    if (choice !== "Overwrite") return;
  }
  const content = await fs.readFile(filePath, "utf-8");
  client.sendNotification("cif/addCifDictionary", {
    path: filePath,
    content,
  });
  const updated = exists ? stored : [...stored, filePath];
  await context.globalState.update("cifDictionaries", updated);
  vscode.window.showInformationMessage(`CIF dictionary added: ${filePath}`);
}
