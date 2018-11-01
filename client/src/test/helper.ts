'use strict';

import * as vscode from 'vscode';
import * as path from 'path';

export let doc: vscode.TextDocument;
export let editor: vscode.TextEditor;
export let documentEol: string;
export let platformEol: string;

export async function activateCifExtension(docUri: vscode.Uri) {
    const extension = vscode.extensions.getExtension('thisperiodictable.cif');
    await extension.activate();
    try {
        doc = await vscode.workspace.openTextDocument(docUri);
        editor = await vscode.window.showTextDocument(doc);
        await waitForServerActivation();
    } catch (e) {
        console.error(e);
    }
}

async function waitForServerActivation() {
    return new Promise(resolve => setTimeout(resolve, 2000));
}

export const getDocUri = (p: string) => {
    let docPath = path.resolve(__dirname, '../../testFixture', p);
    return vscode.Uri.file(docPath);
};

export async function setTestContent(content: string): Promise<boolean> {
    const all = new vscode.Range(
        doc.positionAt(0),
        doc.positionAt(doc.getText().length)
    );
    return editor.edit(eb => eb.replace(all, content));
}
