import { NotificationHandler } from "vscode-languageserver";

interface AddCifDictionaryParams {
  path: string;
  content: string;
}

interface RemoveCifDictionaryParams {
  path: string;
}

const dictionaries = new Map<string, string>();

export const addCifDictionaryHandler: NotificationHandler<
  AddCifDictionaryParams
> = (params) => {
  dictionaries.set(params.path, params.content);
};

export const removeCifDictionaryHandler: NotificationHandler<
  RemoveCifDictionaryParams
> = (params) => {
  dictionaries.delete(params.path);
};

export function getAllDictionaries(): Map<string, string> {
  return dictionaries;
}
