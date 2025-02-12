# CIF for Visual Studio Code

This extension adds support for CIF (_Crystallographic Information File_) to VS Code.

## Features

- Syntax highlighting
- Completion and validation for names
- Hover over value to see corresponding `_key` and `data_`.

## New Setting: Disable Non-Standard Data Name Warnings

By default, CIF validation shows warnings for **non-standard data names**.
If you prefer not to see these warnings, you can **disable them** in settings:

1. Open **Settings** (`Ctrl + ,` / `Cmd + ,` on Mac)
2. Search for **"CIF: Warn On Non Standard Data Names"**
3. Uncheck the option to disable warnings
