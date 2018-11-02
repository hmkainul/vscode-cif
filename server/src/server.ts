'use strict';

import {
    createConnection,
    TextDocuments,
    TextDocument,
    Diagnostic,
    DiagnosticSeverity,
    ProposedFeatures,
    InitializeParams,
    CompletionItem,
    TextDocumentPositionParams
} from 'vscode-languageserver';

import { cifKeys } from './completion';

let connection = createConnection(ProposedFeatures.all);

let documents: TextDocuments = new TextDocuments();

connection.onInitialize((_params: InitializeParams) => {
    return {
        capabilities: {
            textDocumentSync: documents.syncKind,
            completionProvider: {
                resolveProvider: true
            }
        }
    };
});

documents.onDidChangeContent(change => {
    validateCifDocument(change.document);
});

async function validateCifDocument(textDocument: TextDocument): Promise<void> {
    let text = textDocument.getText();
    let pattern = /\b_[^\s]+\b/g;
    let m: RegExpExecArray;
    let diagnostics: Diagnostic[] = [];
    while (m = pattern.exec(text)) {
        if (cifKeys().some(k => k.label === m[0])) {
            continue;
        }
        let diagnosic: Diagnostic = {
            severity: DiagnosticSeverity.Warning,
            range: {
                start: textDocument.positionAt(m.index),
                end: textDocument.positionAt(m.index + m[0].length)
            },
            message: `${m[0]} is not a keyword.`,
            source: 'cif'
        };
        diagnostics.push(diagnosic);
    }
    connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

connection.onCompletion(
    (_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
        return cifKeys();
    }
);

connection.onCompletionResolve(
    (item: CompletionItem): CompletionItem => {
        // item.detail = item.label;
        // item.documentation = item.label;
        return item;
    }
);

documents.listen(connection);
connection.listen();
