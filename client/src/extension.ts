'use strict';

import * as path from 'path';
import { workspace, ExtensionContext } from 'vscode';

import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
    client = new LanguageClient(
        'cifLanguageServer',
        'CIF Language Server',
        serverOptions(context),
        clientOptions()
    );
    client.start();
}

function serverOptions(context: ExtensionContext): ServerOptions {
    let serverModule = context.asAbsolutePath(
        path.join('server', 'out', 'server.js')
    );
    return {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: {
            module: serverModule,
            transport: TransportKind.ipc,
            options: { execArgv: ['--nolazy', '--inspect=6009'] }
        }
    };
}

function clientOptions(): LanguageClientOptions {
    return {
        documentSelector: [{ scheme: 'file', language: 'cif' }],
        synchronize: {
            fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
        }
    };
}

export function deactivate(): Thenable<void> {
    return client ? client.stop() : undefined;
}
