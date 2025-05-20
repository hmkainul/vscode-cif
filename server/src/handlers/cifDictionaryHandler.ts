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
    const definition = tagDefinitions.get(selected.text.toLowerCase());
    return definition?.description
      ? definition?.description + buildHoverMarkdown(definition)
      : "";
  }
  return "";
}

function buildHoverMarkdown(def: CifDefinitionData): string {
  const lines = ["\n```\n", "|          |       |", "|----------|-------|"];
  const pushRow = (
    label: string,
    value?: string | string[] | Map<string, string>,
  ) => {
    if (!value) return;
    let display: string;
    if (value instanceof Map) {
      let first = true;
      for (const [k, v] of value) {
        if (first) {
          lines.push(`| ${label} | **${k}** ${v}|`);
          first = false;
        } else {
          lines.push(`|          | **${k}** ${v} |`);
        }
      }
    } else if (Array.isArray(value)) {
      value.forEach((v, i) => {
        if (i === 0) {
          lines.push(`| ${label} | ${v}|`);
        } else {
          lines.push(`|          | ${v} |`);
        }
      });
    } else {
      display = value;
      lines.push(`| ${label} | ${display} |`);
    }
  };
  pushRow("Alias", def.alias);
  pushRow("Category", def.category);
  pushRow("Object", def.object);
  pushRow("Type", def.type);
  pushRow("Contents", def.contents);
  pushRow("Range", def.range);
  pushRow("Units", def.units);
  pushRow("Update", def.update);
  pushRow("Source", def.source);
  pushRow("Enumeration", def.stateToDetail);
  return lines.join("\n");
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
  stateToDetail?: Map<string, string>;
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
    case "_enumeration_set.state":
      if (!entry.stateToDetail) {
        entry.stateToDetail = new Map<string, string>();
      }
      entry.stateToDetail.set(val, "");
      break;
    case "_enumeration_set.detail":
      if (entry.stateToDetail) {
        const keys = Array.from(entry.stateToDetail.keys());
        const lastKey = keys[keys.length - 1];
        entry.stateToDetail.set(lastKey, val);
      }
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
  if (def.stateToDetail) {
    return def.stateToDetail.has(value);
  }
  if (def.range) {
    if (!isValid(def, value)) return false;
    const numericValue = parseCifNumber(value);
    if (isNaN(numericValue)) return false;
    const [minRaw, maxRaw] = def.range.split(":");
    if (minRaw !== "") {
      const min = parseCifNumber(minRaw);
      if (isNaN(min) || numericValue < min) {
        return false;
      }
    }
    if (maxRaw !== "") {
      const max = parseCifNumber(maxRaw);
      if (isNaN(max) || numericValue > max) {
        return false;
      }
    }
    return true;
  }
  return isValid(def, value);
}

function parseCifNumber(value: string): number {
  return Number(value.replace(/\([0-9]+\)$/, ""));
}

function isValid(def: CifDefinitionData, value: string) {
  switch (def.contents?.toLowerCase()) {
    case "real":
    case "float":
      return isCifReal(value);
    case "integer":
    case "int":
      return isCifInteger(value);
    case "numb":
      return isCifReal(value) || isCifInteger(value);
    case "date":
      return isCifDate(value);
  }
  return true;
}

function isCifReal(value: string): boolean {
  return /^[-+]?\d+(\.\d*)?([eE][-+]?\d+)?(\(\d+\))?$/.test(value);
}

function isCifInteger(value: string): boolean {
  return /^[-+]?\d+(\(\d+\))?$/.test(value);
}

function isCifDate(value: string): boolean {
  const match = value.match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/);
  if (!match) return false;
  const year = parseInt(match[1], 10);
  const month = match[2] ? parseInt(match[2], 10) : undefined;
  const day = match[3] ? parseInt(match[3], 10) : undefined;
  if (!month) return true;
  if (!day) return month >= 1 && month <= 12;
  const date = new Date(
    `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
  );
  return (
    date.getFullYear() === year &&
    date.getMonth() + 1 === month &&
    date.getDate() === day
  );
}
