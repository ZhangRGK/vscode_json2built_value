// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { Parser } from "./libs/parser";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "json2built-value" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "json2built-value.fromFile",
    () => {
      // The code you place here will be executed every time your command is executed
      vscode.window
        .showOpenDialog({
          openLabel: "Open a JSON file",
          canSelectMany: false,
        })
        .then(async (fileUri?: vscode.Uri[]) => {
          if (fileUri && fileUri[0]) {
            const path = fileUri[0];
            const parser = await Parser.load(path);
            vscode.window.showInformationMessage(`Loading file: ${fileUri[0]}`);
            parser.parse();
            vscode.window.showInformationMessage(`Writing files`);
            await parser.write();
          }
          // Display a message box to the user
        });
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
