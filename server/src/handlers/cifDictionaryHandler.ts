import {
  CompletionItem,
  CompletionItemKind,
  NotificationHandler,
} from "vscode-languageserver";
import { parser } from "../parser/parser";
import { Token, TokenType } from "../parser/token";

interface AddCifDictionaryParams {
  path: string;
  content: string;
}

interface RemoveCifDictionaryParams {
  path: string;
}

const dictionaries = new Map<string, string>();

const tagDefinitions = new Map<string, CifDefinitionData>();

const completionItems: CompletionItem[] = [];

export const addCifDictionaryHandler: NotificationHandler<
  AddCifDictionaryParams
> = (params) => {
  dictionaries.set(params.path, params.content);
  const tokens = parser(params.content).tokens;
  collectDefinitions(tokens);
  completionItems.sort((a, b) => {
    const aLabel = a.label.toLowerCase();
    const bLabel = b.label.toLowerCase();
    if (aLabel < bLabel) return -1;
    if (aLabel > bLabel) return 1;
    return 0;
  });
};

export const removeCifDictionaryHandler: NotificationHandler<
  RemoveCifDictionaryParams
> = (params) => {
  dictionaries.delete(params.path);
};

export function cifKeys(): CompletionItem[] {
  return completionItems;
}

export function cifKeysSet(): Set<string> {
  return new Set(tagDefinitions.keys());
}

export function hoverText(selected: Token) {
  if (
    selected.type === TokenType.TAG &&
    tagDefinitions.has(selected.text.toLowerCase())
  ) {
    return tagDefinitions.get(selected.text.toLowerCase())?.description ?? "";
  }
  return "";
}

export interface CifDefinitionData {
  id: string;
  alias?: string[];
  update?: string;
  description?: string;
  category?: string;
  object?: string;
  type?: string;
  source?: string;
  container?: string;
  contents?: string;
  range?: string;
  units?: string;
}

function collectDefinitions(tokens: Token[]) {
  let currentEntry: CifDefinitionData | null = null;
  tokens.forEach((token) => {
    if (token.type === TokenType.SAVE || token.type === TokenType.DATA) {
      if (currentEntry) {
        storeEntryToMap(currentEntry);
      }
      currentEntry = { id: "" };
      return;
    }
    if (currentEntry) {
      updateEntryFromToken(currentEntry, token);
    }
  });
  if (currentEntry) {
    storeEntryToMap(currentEntry);
  }
}

function updateEntryFromToken(entry: CifDefinitionData, token: Token): void {
  const val = token.text;
  switch (token.tag?.text) {
    case "_definition.id":
    case "_name":
    case "_item.name":
      if (entry.id === "") {
        entry.id = val;
      } else {
        if (entry.alias) {
          entry.alias.push(val);
        } else {
          entry.alias = [val];
        }
      }
      break;
    case "_alias.definition_id":
      if (entry.alias) {
        entry.alias.push(val);
      } else {
        entry.alias = [val];
      }
      break;
    case "_definition.update":
      entry.update = val;
      break;
    case "_description.text":
    case "_description":
      entry.description = val;
      break;
    case "_name.category_id":
      entry.category = val;
      break;
    case "_name.object_id":
      entry.object = val;
      break;
    case "_type.purpose":
      entry.type = val;
      break;
    case "_type.source":
      entry.source = val;
      break;
    case "_type.container":
      entry.container = val;
      break;
    case "_type.contents":
      entry.contents = val;
      break;
    case "_enumeration.range":
      entry.range = val;
      break;
    case "_units.code":
      entry.units = val;
      break;
  }
}

function storeEntryToMap(entry: CifDefinitionData) {
  if (!entry.id || !(entry.id.charAt(1) === "_")) return;
  setEntry(entry.id, entry);
  if (entry.alias) {
    entry.alias.forEach((alias) => {
      setEntry(alias, entry);
    });
  }
}

function setEntry(keyWithQuotes: string, entry: CifDefinitionData) {
  const key = keyWithQuotes.slice(1, -1);
  tagDefinitions.set(key.toLowerCase(), entry);
  completionItems.push({
    label: key,
    kind: CompletionItemKind.Variable,
    data: key,
  });
}

export function isValidValue(token: Token) {
  const tag = token.tag?.text;
  const value = token.text;
  if (!tag || !value) return true;
  if (value === "." || value === "?") return true;
  const def = tagDefinitions.get(tag.toLowerCase());
  if (!def) return true;
  let isValid = true;
  switch (def.contents) {
    case "Real":
      isValid = isCifReal(value);
      break;
    case "Integer":
      isValid = isCifInteger(value);
      break;
    case "numb":
      isValid = isCifReal(value) || isCifInteger(value);
      break;
  }
  return isValid;
}

function isCifReal(value: string): boolean {
  return /^[-+]?\d+(\.\d*)?([eE][-+]?\d+)?(\(\d+\))?$/.test(value);
}

function isCifInteger(value: string): boolean {
  return /^[-+]?\d+(\(\d+\))?$/.test(value);
}
