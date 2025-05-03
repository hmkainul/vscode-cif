"use strict";

import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { workspace, ExtensionContext } from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";
import { addCifDictionary } from "./commands/addCifDictionary";
import { removeCifDictionary } from "./commands/removeCifDictionary";
import { showCifDictionaries } from "./commands/showCifDictionaries";

let client: LanguageClient;

export function activate(context: ExtensionContext) {
  client = new LanguageClient(
    "cifLanguageServer",
    "CIF Language Server",
    serverOptions(context),
    clientOptions(),
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("cif.addCifDictionary", (uri: vscode.Uri) =>
      addCifDictionary(uri, context, client),
    ),
    vscode.commands.registerCommand("cif.showCifDictionaries", () =>
      showCifDictionaries(context),
    ),
    vscode.commands.registerCommand("cif.removeCifDictionary", () =>
      removeCifDictionary(context, client),
    ),
  );
  loadBuiltinDictionaries(context, client);
  client.start();
}

function serverOptions(context: ExtensionContext): ServerOptions {
  const serverModule = context.asAbsolutePath(
    path.join("server", "out", "server.js"),
  );
  return {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: { execArgv: ["--nolazy", "--inspect=6009"] },
    },
  };
}

function clientOptions(): LanguageClientOptions {
  return {
    documentSelector: [{ scheme: "file", language: "cif" }],
    synchronize: {
      fileEvents: workspace.createFileSystemWatcher("**/.clientrc"),
      configurationSection: "cif",
    },
    initializationOptions: workspace.getConfiguration("cif"),
  };
}

export function deactivate(): Thenable<void> {
  return client ? client.stop() : undefined;
}

function loadBuiltinDictionaries(
  context: vscode.ExtensionContext,
  client: LanguageClient,
) {
  const resourceDir = path.join(context.extensionPath, "client", "resources");
  try {
    const files = fs.readdirSync(resourceDir).filter((name) => {
      const fullPath = path.join(resourceDir, name);
      return fs.statSync(fullPath).isFile();
    });
    if (files.length === 0) {
      vscode.window.showInformationMessage(
        "No built-in CIF dictionaries found.",
      );
    }
    for (const file of files) {
      const fullPath = path.join(resourceDir, file);
      const content = fs.readFileSync(fullPath, "utf8");
      client.sendNotification("cif/addCifDictionary", {
        path: `${file}`,
        content,
      });
    }
  } catch (err) {
    vscode.window.showInformationMessage(
      "Failed to load built-in CIF dictionaries: " + err,
    );
  }
}
