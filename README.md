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

## CIF Dictionaries

This software uses CIF dictionaries provided by the International Union of Crystallography (IUCr), available at
[https://www.iucr.org/resources/cif/dictionaries](https://www.iucr.org/resources/cif/dictionaries).

## Technical Details

If you want to build the program yourself or better understand how it works,
see the [docs/](https://github.com/hmkainul/vscode-cif/tree/master/docs) directory.

## Contact

For enquiries related to the development of this extension, or to provide suggestions or feedback, please contact [Dr Kaisa Helttunen](https://www.jyu.fi/en/people/kaisa-helttunen).
