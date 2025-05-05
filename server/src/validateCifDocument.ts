import { TextDocument } from "vscode-languageserver-textdocument";
import {
  Connection,
  Diagnostic,
  DiagnosticSeverity,
  Range,
} from "vscode-languageserver/node";
import { Token, TokenType } from "./parser/token";
import { cifKeysSet } from "./handlers/cifDictionaryHandler";
import { ParserResult } from "./parser/parser";
import { formatParserError, ParserError } from "./parser/parserErrors";

export async function validateCifDocument(
  textDocument: TextDocument,
  tokensAndErrors: ParserResult,
  connection: Connection,
  warnOnNonStandardNames: boolean,
): Promise<void> {
  const diagnostics: Diagnostic[] = [];
  showParserErrors(diagnostics, tokensAndErrors.errors);
  const seenBlocks = new Set<string>();
  const blockTagMap = new Map<string, Set<string>>();
  let currentBlockName: string | null = null;
  const keys = cifKeysSet();
  for (const token of tokensAndErrors.tokens) {
    if (token.type === TokenType.DATA || token.type === TokenType.SAVE) {
      checkDuplicateDataOrSaveBlocks(token, seenBlocks, diagnostics);
      currentBlockName = token.text;
      if (!blockTagMap.has(currentBlockName)) {
        blockTagMap.set(currentBlockName, new Set());
      }
    }
    if (token.type === TokenType.TAG) {
      if (warnOnNonStandardNames) {
        checkUnknownTags(keys, token, diagnostics);
      }
      const blockName = token.save?.text || token.block?.text;
      if (blockName) {
        checkDuplicateTags(token, blockName, blockTagMap, diagnostics);
      }
    }
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

function checkDuplicateDataOrSaveBlocks(
  token: Token,
  seenBlocks: Set<string>,
  diagnostics: Diagnostic[],
) {
  if (seenBlocks.has(token.text)) {
    diagnostics.push({
      severity: DiagnosticSeverity.Warning,
      range: token.range,
      message: `'${token.text}' is defined multiple times.`,
      source: "cif",
    });
  } else {
    seenBlocks.add(token.text);
  }
}

function checkDuplicateTags(
  token: Token,
  blockName: string | null,
  blockTagMap: Map<string, Set<string>>,
  diagnostics: Diagnostic[],
) {
  if (!blockName) return;
  const tags = blockTagMap.get(blockName) ?? new Set();
  if (tags.has(token.text)) {
    diagnostics.push({
      severity: DiagnosticSeverity.Warning,
      range: token.range,
      message: `${token.text}' appears multiple times in '${blockName}'.`,
      source: "cif",
    });
  } else {
    tags.add(token.text);
    blockTagMap.set(blockName, tags);
  }
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
          "Non-standard data name warnings are enabled. You can disable them in Settings > CIF: Show warnings for non-standard data names",
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
