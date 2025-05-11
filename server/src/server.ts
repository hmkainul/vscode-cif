"use strict";

import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  CompletionItem,
  TextDocumentPositionParams,
  Hover,
  Position,
} from "vscode-languageserver/node";

import { TextDocument } from "vscode-languageserver-textdocument";

import { cifKeys, hoverText } from "./handlers/cifDictionaryHandler";
import { parser } from "./parser/parser";
import { Token } from "./parser/token";
import { validateCifDocument } from "./validateCifDocument";
import {
  addCifDictionaryHandler,
  removeCifDictionaryHandler,
} from "./handlers/cifDictionaryHandler";

const connection = createConnection(ProposedFeatures.all);

const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

const trees: { [uri: string]: Token[] } = {};

let warnOnNonStandardNames = true;

connection.onDidChangeConfiguration((change) => {
  const settings = change.settings.cif || {};
  warnOnNonStandardNames = settings.warnOnNonStandardDataNames ?? true;
  documents.all().forEach((document) => {
    const tokensAndErrors = parser(document.getText());
    trees[document.uri] = tokensAndErrors.tokens;
    validateCifDocument(
      document,
      tokensAndErrors,
      connection,
      warnOnNonStandardNames,
    );
  });
});

connection.onInitialize((params) => {
  warnOnNonStandardNames =
    params.initializationOptions?.warnOnNonStandardDataNames ?? true;
  return {
    capabilities: {
      completionProvider: {
        resolveProvider: true,
      },
      hoverProvider: true,
    },
  };
});

documents.onDidChangeContent((change) => {
  const textDocument = change.document;
  const tokensAndErrors = parser(textDocument.getText());
  trees[textDocument.uri] = tokensAndErrors.tokens;
  validateCifDocument(
    change.document,
    tokensAndErrors,
    connection,
    warnOnNonStandardNames,
  );
});

connection.onCompletion((): CompletionItem[] => {
  return cifKeys();
});

connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
  return item;
});

connection.onHover(
  (textDocumentPosition: TextDocumentPositionParams): Hover => {
    const uri = textDocumentPosition.textDocument.uri;
    const position = textDocumentPosition.position;
    const tokens = trees[uri];
    if (tokens) {
      const selected = tokens.find(
        (t) =>
          isBeforeOrSame(t.range.start, position) &&
          isBeforeOrSame(position, t.range.end),
      );
      if (selected) {
        const result =
          "```cif" +
          [selected.block, selected.save, selected.loop, selected.tag, selected]
            .filter((token) => token)
            .map(
              (token, index) =>
                "\n" +
                "    ".repeat(index) +
                token.text.substring(0, Math.min(token.text.length, 72)),
            )
            .join("") +
          "\n" +
          hoverText(selected) +
          "\n```";
        return {
          contents: result,
        };
      }
    }
    return null;
  },
);

function isBeforeOrSame(a: Position, b: Position): boolean {
  return a.line < b.line || (a.line == b.line && a.character <= b.character);
}

connection.onNotification("cif/addCifDictionary", addCifDictionaryHandler);
connection.onNotification(
  "cif/removeCifDictionary",
  removeCifDictionaryHandler,
);

documents.listen(connection);
connection.listen();
