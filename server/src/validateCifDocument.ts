import { TextDocument } from "vscode-languageserver-textdocument";
import {
  Connection,
  Diagnostic,
  DiagnosticSeverity,
} from "vscode-languageserver/node";
import { Token, TokenType } from "./lexer";
import { cifKeysSet } from "./completion";

export async function validateCifDocument(
  textDocument: TextDocument,
  tokens: Token[],
  connection: Connection,
  warnOnNonStandardNames: boolean,
): Promise<void> {
  const diagnostics: Diagnostic[] = [];
  const seenBlocks = new Set<string>();
  const blockTagMap = new Map<string, Set<string>>();
  let currentBlockName: string | null = null;
  const keys = cifKeysSet();
  for (const token of tokens) {
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
