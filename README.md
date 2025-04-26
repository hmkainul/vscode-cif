# CIF for Visual Studio Code

This extension adds support for CIF (_Crystallographic Information File_) to VS Code.

## Features

- Syntax highlighting
- Completion and validation for names
- Hover over value to see corresponding `_key` and `data_`.

## New Setting: Disable Non-Standard Data Name Warnings

By default, CIF validation shows warnings for **non-standard data names**.
If you prefer not to see these warnings, you can **disable them** in settings:

1. Open **Settings** by holding **Ctrl** (or **Cmd** on Mac) and pressing **,** (comma key)
2. Search for **"CIF: Warn On Non Standard Data Names"**
3. Uncheck the option to disable warnings

## Technical Details

If you want to build the program yourself or better understand how it works,
see the [docs/](https://github.com/hmkainul/vscode-cif/tree/master/docs) directory.
