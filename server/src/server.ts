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
    TextDocumentPositionParams,
    Hover
} from 'vscode-languageserver';

import { cifKeys } from './completion';
import { Token, parser } from './parser';

let connection = createConnection(ProposedFeatures.all);

let documents: TextDocuments = new TextDocuments();

let trees: { [uri: string]: Token[] } = {};

connection.onInitialize((_params: InitializeParams) => {
    return {
        capabilities: {
            textDocumentSync: documents.syncKind,
            completionProvider: {
                resolveProvider: true
            },
            hoverProvider: true
        }
    };
});

documents.onDidChangeContent(change => {
    validateCifDocument(change.document);
});

async function validateCifDocument(textDocument: TextDocument): Promise<void> {
    let text = textDocument.getText();
    let tokens = parser(text);
    trees[textDocument.uri] = tokens;
    let pattern = /\b_[^\s]+(?=($|\s))/g;
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

connection.onHover(
    (textDocumentPosition: TextDocumentPositionParams): Hover => {
        let uri = textDocumentPosition.textDocument.uri;
        let position = textDocumentPosition.position;
        let tokens = trees[uri];
        if (tokens) {
            let selected = tokens.find(t =>
                t.line == position.line
                && t.column <= position.character
                && (t.column + t.text.length) > position.character
            );
            if (selected) {
                let result = '```cif' +
                    [selected.block, selected.loop, selected.tag, selected]
                        .filter(token => token)
                        .map((token, index) => '\n' + '    '.repeat(index) + token.text)
                        .join('')
                    + '\n```';
                return {
                    contents: result
                };
            }
        }
        return null;
    }
);

documents.listen(connection);
connection.listen();
