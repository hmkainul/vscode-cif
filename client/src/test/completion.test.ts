"use strict";

import * as vscode from "vscode";
import * as assert from "assert";
import { activateExtension } from "./activator";

suite("Should do completion", () => {
  test("Completes _tag in cif file", async () => await testCompletion());
});

async function testCompletion() {
  const docUri = await activateExtension("completion.cif");
  const actualCompletionList = (await vscode.commands.executeCommand(
    "vscode.executeCompletionItemProvider",
    docUri,
    new vscode.Position(0, 0),
  )) as vscode.CompletionList;
  const partialExpectedResult = [
    "_atom_site_aniso_B_11",
    "_restr_angle_atom_site_label_1",
    "_pd_block_id",
    "_atom_site_occ_modulation_flag",
    "_atom_local_axes_atom0",
    "_twin_formation_mechanism",
    "_array_data.binary_id",
    "_space_group.IT_coordinate_system_code",
  ];
  partialExpectedResult.forEach((expectedItem) => {
    assert.ok(actualCompletionList.items.some((i) => i.label === expectedItem), expectedItem);
  });
}
