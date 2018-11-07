'use strict';

import {
    createConnection,
    TextDocuments,
    TextDocument,
    DiagnosticSeverity,
    ProposedFeatures,
    InitializeParams,
    CompletionItem,
    TextDocumentPositionParams,
    Hover
} from 'vscode-languageserver';

import { cifKeys } from './completion';
import { Token, parser } from './parser';
import { TokenType } from './lexer';

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
    let tokens = parser(textDocument.getText());
    trees[textDocument.uri] = tokens;
    let diagnostics = tokens
        .filter(token => token.type === TokenType.TAG
            && !cifKeys().some(k => k.label === token.text))
        .map(token => {
            return {
                severity: DiagnosticSeverity.Warning,
                range: {
                    start: { line: token.line, character: token.column },
                    end: { line: token.line, character: token.column + token.text.length }
                },
                message: `${token.text} is not a keyword.`,
                source: 'cif'
            }
        });
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
