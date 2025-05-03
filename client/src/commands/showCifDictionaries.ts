import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export async function showCifDictionaries(context: vscode.ExtensionContext) {
  const userAdded = context.globalState.get<string[]>("cifDictionaries") || [];
  const builtinDir = path.join(context.extensionPath, "client", "resources");
  let builtinPaths: string[] = [];
  try {
    builtinPaths = fs
      .readdirSync(builtinDir)
      .filter((f) => f.endsWith(".dic"))
      .map((f) => path.join(builtinDir, f));
  } catch (err) {
    vscode.window.showInformationMessage(
      "Could not read built-in dictionaries: " + err,
    );
  }
  const all = [
    ...builtinPaths.map((p) => ({
      label: path.basename(p),
      description: "",
      detail: "Built-in",
      fullPath: p,
    })),
    ...userAdded.map((p) => ({
      label: path.basename(p),
      description: "",
      detail: "User added",
      fullPath: p,
    })),
  ];
  if (all.length === 0) {
    vscode.window.showInformationMessage("No CIF dictionaries found.");
    return;
  }
  const selected = await vscode.window.showQuickPick(all, {
    placeHolder: "Select a CIF dictionary to open",
  });
  if (selected) {
    vscode.window.showTextDocument(vscode.Uri.file(selected.fullPath));
  }
}
