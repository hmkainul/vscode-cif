# CIF extension for Visual Studio Code - Developer Guide

## How to Build a VSIX Package

The easiest and recommended way to install the CIF extension is from the [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=thisperiodictable.cif). Simply open the Extensions panel in VS Code and search for "CIF".

For users of VS Code-compatible editors that do not use the Marketplace, the extension is also available on [Open VSX](https://open-vsx.org/extension/thisperiodictable/cif).

However, if you are curious or have a specific reason to build the extension from source, here are the steps.

### Source

GitHub repository: [https://github.com/hmkainul/vscode-cif](https://github.com/hmkainul/vscode-cif)

### Prerequisites

You need the following installed:

- [Node.js](https://nodejs.org/) (version 18 or newer recommended)
- `npm` (comes with Node.js) (version 8.5+)
- [Git](https://git-scm.com/)
- [Visual Studio Code](https://code.visualstudio.com/) (version 1.75.0 or newer)
- `vsce` — VS Code Extension CLI

Install `vsce` globally if you haven't already:

```bash
npm install -g @vscode/vsce
```

You can check your versions with:

```bash
node -v
npm -v
code --version
vsce --version
```

### Build Steps

1. Clone the repository:

```bash
git clone https://github.com/hmkainul/vscode-cif.git
cd vscode-cif
```

2. Install all dependencies

```bash
npm install
```

3. Build the project:

```bash
npm run compile
```

4. Package the extension:

```bash
vsce package -o vscode-cif-self-build.vsix
```

This will generate a file like:

```
vscode-cif-self-build.vsix
```

You can now install it.

### Install the VSIX Locally

You can install the `.vsix` package in two ways:

**From the command line:**

```bash
code --install-extension vscode-cif-self-build.vsix
```

**Or from within VS Code:**

1. Open VS Code
2. Go to the Extensions view (Ctrl+Shift+X or Cmd+Shift+X)
3. Click the three-dot menu in the top right corner
4. Choose "Install from VSIX..."
5. Select the generated `.vsix` file

You're now ready to use the extension.
