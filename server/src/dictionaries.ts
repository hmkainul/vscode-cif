import { parser } from "./parser";
import { readFile as readFileSync } from "fs";
import { readdir, readFile, writeFile } from "fs/promises";
import { extname, join } from "path";

export function readRegister() {
  readFileSync(
    "cifdic.register",
    "utf8",
    function (err: NodeJS.ErrnoException, data: string) {
      if (err) {
        return console.log(err);
      }
      const tokens = parser(data).tokens;
      const nameToUrl = new Map();
      let name = "";
      tokens.forEach((token) => {
        if (token.tag && token.tag.text === "_cifdic_dictionary.name") {
          name = token.text;
        }
        if (token.tag && token.tag.text === "_cifdic_dictionary.URL") {
          nameToUrl.set(name, token.text);
        }
      });
      nameToUrl.forEach((value) => {
        console.log("curl -O " + value);
      });
    },
  );
}

const directoryPath = "./server/dictionaries/";
const allowedExtensions = [".dic", ".c95", ".c96"];

async function getFilesWithExtensions(
  dir: string,
  extensions: string[],
): Promise<string[]> {
  try {
    const files = await readdir(dir);
    return files
      .filter((file) => extensions.includes(extname(file)))
      .map((file) => join(dir, file));
  } catch (error) {
    console.error("Error reading file:", error);
    return [];
  }
}

async function readFilesAsync(
  files: string[],
): Promise<{ file: string; content: string }[]> {
  try {
    const fileReadPromises = files.map(async (file) => {
      const content = await readFile(file, "utf-8");
      return { file, content };
    });
    return await Promise.all(fileReadPromises);
  } catch (error) {
    console.error("Error reading files:", error);
    return [];
  }
}

export async function dictionaries(): Promise<string[]> {
  const files = await getFilesWithExtensions(directoryPath, allowedExtensions);
  const fileContents = await readFilesAsync(files);
  const extractedTags: string[] = [];
  fileContents.forEach((x) => {
    const tokens = parser(x.content).tokens;
    // let dic = "";
    tokens.forEach((t) => {
      if (!t.tag) {
        return;
      }
      /*if (
        t.tag.text === "_dictionary.title" ||
        t.tag.text === "_dictionary_name"
      ) {
        dic = t.text;
      }*/
      if (
        (t.tag.text === "_definition.id" ||
          t.tag.text === "_name" ||
          t.tag.text === "_item.name" ||
          t.tag.text === "_alias.definition_id") &&
        t.text.startsWith("'_")
      ) {
        extractedTags.push(`${t.text?.slice(1, -1)}`);
      }
    });
  });
  const uniqueTags = [...new Set(extractedTags)].sort();
  const outputPath = "./output_cif_tags.txt";
  const outputData = uniqueTags.join("\n");
  try {
    await writeFile(outputPath, outputData, "utf-8");
    console.log(`File ready: ${outputPath}`);
  } catch (error) {
    console.error("Error writing file:", error);
  }
  return uniqueTags;
}
