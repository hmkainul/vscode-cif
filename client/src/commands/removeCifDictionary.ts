import * as vscode from "vscode";
import { LanguageClient } from "vscode-languageclient/node";

export async function removeCifDictionary(
  context: vscode.ExtensionContext,
  client: LanguageClient,
) {
  const stored = context.globalState.get<string[]>("cifDictionaries") || [];
  if (stored.length === 0) {
    vscode.window.showInformationMessage("No CIF dictionaries to remove.");
    return;
  }
  const toRemove = await vscode.window.showQuickPick(stored, {
    placeHolder: "Select a CIF dictionary to remove",
  });
  if (!toRemove) return;
  const updated = stored.filter((path) => path !== toRemove);
  await context.globalState.update("cifDictionaries", updated);
  client.sendNotification("cif/removeCifDictionary", { path: toRemove });
  vscode.window.showInformationMessage(`Removed CIF dictionary: ${toRemove}`);
}
