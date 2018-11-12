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
    Hover,
    Position
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
                range: token.range,
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
                isBeforeOrSame(t.range.start, position)
                &&
                isBeforeOrSame(position, t.range.end)
            );
            if (selected) {
                let result = '```cif' +
                    [selected.block, selected.loop, selected.tag, selected]
                        .filter(token => token)
                        .map((token, index) => '\n' + '    '.repeat(index) + token.text.substring(0, Math.min(token.text.length, 72)))
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

function isBeforeOrSame(a: Position, b: Position): boolean {
    return (a.line < b.line)
        || (a.line == b.line && a.character <= b.character);
}

documents.listen(connection);
connection.listen();
