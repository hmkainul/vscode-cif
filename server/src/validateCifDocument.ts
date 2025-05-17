import { TextDocument } from "vscode-languageserver-textdocument";
import {
  Connection,
  Diagnostic,
  DiagnosticSeverity,
  Range,
} from "vscode-languageserver/node";
import { isValue, ParserResult, Token, TokenType } from "./parser/token";
import { cifKeysSet, isValidValue } from "./handlers/cifDictionaryHandler";
import { formatParserError, ParserError } from "./parser/parserErrors";

export async function validateCifDocument(
  textDocument: TextDocument,
  tokensAndErrors: ParserResult,
  connection: Connection,
  warnOnNonStandardNames: boolean,
): Promise<void> {
  const diagnostics: Diagnostic[] = [];
  showParserErrors(diagnostics, tokensAndErrors.errors);
  const keys = cifKeysSet();
  if (warnOnNonStandardNames) {
    tokensAndErrors.tokens
      .filter((token) => token.type === TokenType.TAG)
      .forEach((token) => checkUnknownTags(keys, token, diagnostics));
    tokensAndErrors.tokens
      .filter((token) => isValue(token))
      .forEach((token) => validateByType(token, diagnostics));
  }
  connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

function showParserErrors(diagnostics: Diagnostic[], errors: ParserError[]) {
  errors.forEach((parserError) => {
    diagnostics.push({
      severity: DiagnosticSeverity.Warning,
      range: parserError.token?.range ?? fallbackRange(),
      message: formatParserError(parserError) + " " + parserError.token?.text,
      source: "cif",
    });
  });
}

function fallbackRange(): Range {
  return {
    start: { line: 0, character: 0 },
    end: { line: 0, character: 1 },
  };
}

let hasAddedInfoMessage = false;

function checkUnknownTags(
  keys: Set<string>,
  token: Token,
  diagnostics: Diagnostic[],
) {
  if (!token.text) {
    return;
  }
  if (!keys.has(token.text.toLowerCase())) {
    if (!hasAddedInfoMessage) {
      diagnostics.push({
        severity: DiagnosticSeverity.Information,
        range: token.range,
        message:
          "Non-standard data name warnings are enabled. " +
          "You can disable them in Settings > CIF: Show warnings for non-standard data names",
        source: "cif",
      });
      hasAddedInfoMessage = true;
    }
    diagnostics.push({
      severity: DiagnosticSeverity.Warning,
      range: token.range,
      message: `'${token.text}' is a non-standard data name.`,
      source: "cif",
    });
  }
}

function validateByType(token: Token, diagnostics: Diagnostic[]): void {
  if (isValidValue(token)) return;
  diagnostics.push({
    message: `Value "${token.text}" is not valid for ${token.tag?.text}`,
    severity: DiagnosticSeverity.Warning,
    range: token.range,
  });
}
