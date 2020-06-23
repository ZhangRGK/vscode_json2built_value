// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { Parser } from "./libs/parser";
import { statSync } from "fs";
import { checkUrlValid } from "./libs/utils";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let disposableFromFile = vscode.commands.registerCommand(
    "json2built-value.fromFile",
    fromFile
  );
  let disposableFromUrl = vscode.commands.registerCommand(
    "json2built-value.fromUrl",
    fromUrl
  );

  context.subscriptions.push(disposableFromFile);
  context.subscriptions.push(disposableFromUrl);
}

const fromFile = async () => {
  // The code you place here will be executed every time your command is executed
  const fileUri = await vscode.window.showOpenDialog({
    openLabel: "Open a JSON file",
    canSelectMany: false,
  });
  if (fileUri && fileUri[0]) {
    const path = fileUri[0];
    const parser = await Parser.loadUri(path);
    await writeFiles(parser);
  }
};

const fromUrl = async () => {
  const url = await vscode.window.showInputBox({
    prompt: "Please enter an http(or https) url",
    ignoreFocusOut: true,
    placeHolder: "https://example.com",
    validateInput: (value) =>
      !checkUrlValid(value) ? "Url must start with http or https." : "",
  });
  const fileUri = await vscode.window.showOpenDialog({
    openLabel: "Select a folder",
    canSelectMany: false,
    canSelectFolders: true,
  });
  if (
    url &&
    fileUri &&
    fileUri[0] &&
    statSync(fileUri[0].fsPath).isDirectory()
  ) {
    const path = fileUri[0];
    const parser = await Parser.loadUrl(url, path);
    await writeFiles(parser);
  }
};

const writeFiles = async (parser: Parser) => {
  parser.parse();
  vscode.window.showInformationMessage(`Generating files`);
  await parser.write();
  vscode.window.showInformationMessage(`Done`);
};

// this method is called when your extension is deactivated
export function deactivate() {}
