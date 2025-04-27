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

import { cifKeys } from "./completion";
import { parser } from "./parser";
import { Token } from "./lexer";
import { validateCifDocument } from "./validateCifDocument";

const connection = createConnection(ProposedFeatures.all);

const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

const trees: { [uri: string]: Token[] } = {};

let warnOnNonStandardNames = true;

connection.onDidChangeConfiguration((change) => {
  const settings = change.settings.cif || {};
  warnOnNonStandardNames = settings.warnOnNonStandardDataNames ?? true;
  documents.all().forEach((document) => {
    const tokens = parser(document.getText());
    trees[document.uri] = tokens;
    validateCifDocument(document, tokens, connection, warnOnNonStandardNames);
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
  const tokens = parser(textDocument.getText());
  trees[textDocument.uri] = tokens;
  validateCifDocument(
    change.document,
    tokens,
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

documents.listen(connection);
connection.listen();
