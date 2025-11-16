# CIF for Visual Studio Code

This extension adds support for CIF (_Crystallographic Information File_) to VS Code.

## Features

- Syntax highlighting
- Completion and validation for names
- Hover over value to see corresponding `_key` and `data_`.

## Setting: Disable Non-Standard Data Name Warnings

By default, CIF validation shows warnings for data names (tags) that are not defined in the currently loaded CIF dictionaries.

If you prefer not to see these warnings, you can **disable them** in settings:

1. Open **Settings** by holding **Ctrl** (or **Cmd** on Mac) and pressing **,** (comma key)
2. Search for **"CIF: Warn On Non Standard Data Names"**
3. Uncheck the option to disable warnings

## CIF Dictionaries

This software uses CIF dictionaries provided by the International Union of Crystallography (IUCr), available at
[https://www.iucr.org/resources/cif/dictionaries](https://www.iucr.org/resources/cif/dictionaries).

You can load additional dictionaries manually using the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`):

### Available commands

- **CIF: Add Dictionary**
  Select and load a dictionary file from your local system.

- **CIF: Show Loaded Dictionaries**
  Displays the list of currently active CIF dictionaries.

- **CIF: Remove Dictionary**
  Unload a previously added dictionary.

## Technical Details

If you want to build the program yourself or better understand how it works,
see the [docs/](https://github.com/hmkainul/vscode-cif/tree/master/docs) directory.

## Contact

For enquiries related to the development of this extension, or to provide suggestions or feedback, please contact [Dr Kaisa Helttunen](https://www.jyu.fi/en/people/kaisa-helttunen).

## References

This extension has been described in the following publication:

Helttunen, K. & Kainulainen, H. (2025). [CIF extension for Visual Studio Code](https://doi.org/10.1107/S1600576725005217). *J. Appl. Cryst.* **58**, 1469-1475.
