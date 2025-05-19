# Using the CIF Language Server in PyCharm (Proof of Concept)

This guide explains how to use the CIF Language Server (LSP) in PyCharm for `.cif` files using the LSP Support plugin by Red Hat.

**Note:** This is a proof of concept (PoC) intended to demonstrate that our VS Code-compatible CIF language server also works in other editors, such as PyCharm. We may provide a more polished and user-friendly version in the future.

## Prerequisites

- PyCharm 2025.1 or newer
- Node.js installed and available in your system PATH
- CIF Language Server source code
- Run `npm install` and `npm run compile` inside the project to build the server

## Syntax Highlighting and LSP – One at a Time

We were not yet able to get **TextMate-based syntax highlighting** and **LSP features** working simultaneously in PyCharm.

You can use **either**:

- **LSP features** (hover, diagnostics, completions),
- **or syntax highlighting** (via a TextMate grammar `cif.tmLanguage.json`)

but not both at the same time in our current setup.

## Option A: LSP

**Install the LSP Support Plugin**

1. Open PyCharm
2. Go to **File > Settings > Plugins**
3. Open the **Marketplace** tab
4. Search for "LSP4IJ" (by Red Hat)
5. Click **Install** and restart PyCharm

**Register the `.cif` File Type (for LSP)**

1. Go to **File > Settings > Editor > File Types**
2. Click the "+" icon to create a new file type
3. Name it **CIF**
4. Add the pattern `*.cif` under **File name patterns**
5. Save the changes

**Add the CIF Language Server**

1. Go to **Settings > Languages & Frameworks > Language Server Protocol**
2. Click **+ Add Server**
3. Use the following configuration:

| Setting   | Value                                      |
| --------- | ------------------------------------------ |
| Name      | CIF LSP                                    |
| Command   | `node server/out/server.js --stdio`        |
| File type | Select the `CIF` file type created earlier |

**Open a `.cif` File and Test**

Open a `.cif` file in PyCharm. If the LSP server is configured correctly, it will start automatically.

## Option B: Syntax Highlighting

1. Go to **Settings > Editor > TextMate Bundles**
2. Click **+** to add a bundle
3. Select the root folder of the extension (e.g. `vscode-cif/`, which contains `syntaxes/`)
