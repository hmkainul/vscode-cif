import * as vscode from "vscode";

export async function showCifDictionaries(
  context: vscode.ExtensionContext,
) {
  const stored = context.globalState.get<string[]>("cifDictionaries") || [];
  if (stored.length === 0) {
    vscode.window.showInformationMessage(
      "No CIF dictionaries have been added.",
    );
    return;
  }
  const selected = await vscode.window.showQuickPick(stored, {
    canPickMany: false,
    placeHolder: "Added CIF dictionary files",
  });
  if (selected) {
    vscode.window.showTextDocument(vscode.Uri.file(selected));
  }
}
