import {
  CompletionItem,
  CompletionItemKind,
  NotificationHandler,
} from "vscode-languageserver";
import { parser } from "../parser/parser";

interface AddCifDictionaryParams {
  path: string;
  content: string;
}

interface RemoveCifDictionaryParams {
  path: string;
}

const dictionaries = new Map<string, string>();

const tags = new Map<string, string>();

const completionItems: CompletionItem[] = [];

export const addCifDictionaryHandler: NotificationHandler<
  AddCifDictionaryParams
> = (params) => {
  dictionaries.set(params.path, params.content);
  const tokens = parser(params.content).tokens;
  tokens.forEach((t) => {
    if (!t.tag) {
      return;
    }
    if (
      (t.tag.text === "_definition.id" ||
        t.tag.text === "_name" ||
        t.tag.text === "_item.name" ||
        t.tag.text === "_alias.definition_id") &&
      t.text.startsWith("'_")
    ) {
      const text = t.text?.slice(1, -1);
      tags.set(text.toLowerCase(), "");
      completionItems.push({
        label: text,
        kind: CompletionItemKind.Variable,
        data: text,
      });
    }
  });
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
  return new Set(tags.keys());
}
