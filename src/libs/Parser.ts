import * as vscode from "vscode";
import * as path from "path";
import axios from "axios";
import { TextDecoder } from "util";
import {
  appendStringProperty,
  appendNumberProperty,
  appendArrayProperty,
  appendObjectProperty,
} from "./formatter";
import { convertFileName, composeFile, writeFile, isDirectory } from "./utils";
import { ResponseTypeError, FileLoadError, ParseJSONError } from "./errors";

export interface IGeneratedFile {
  name: string;
  properties: string[];
  refers: string[];
}

export class Parser {
  private uri: vscode.Uri;
  private json: any;
  private files: IGeneratedFile[] = [];

  private constructor(uri: vscode.Uri, json: any) {
    this.uri = uri;
    this.json = json;
  }

  static async loadUri(uri: vscode.Uri): Promise<Parser> {
    const content: Uint8Array = await vscode.workspace.fs.readFile(uri);
    let jsonString;
    try {
      jsonString = new TextDecoder("utf-8").decode(content);
    } catch (e) {
      throw new FileLoadError();
    }
    try {
      const json = JSON.parse(jsonString);
      return new Parser(uri, json);
    } catch (e) {
      throw new ParseJSONError();
    }
  }

  static async loadUrl(url: string, uri: vscode.Uri): Promise<Parser> {
    const response = await axios.get(url);
    if (
      !(response.headers["content-type"] as string).includes("application/json")
    ) {
      throw new ResponseTypeError(url);
    }

    return new Parser(uri, response.data);
  }

  getProperties(json: any) {
    const properties: string[] = [];
    const refers: string[] = [];
    for (let key in json) {
      const value = json[key];
      const type = typeof value;
      let property: string = "";
      let refer: string | null = null;
      if (value === null) {
      } else if (type === "string") {
        [property, refer] = appendStringProperty(key);
      } else if (type === "number") {
        [property, refer] = appendNumberProperty(key, value);
      } else if (type === "object" && Array.isArray(value)) {
        [property, refer] = appendArrayProperty(key, value, this.files);
      } else if (type === "object") {
        [property, refer] = appendObjectProperty(key, value);
      }
      if (property !== "") {
        properties.push(property);
      }
      if (refer != null) {
        refers.push(refer);
        this.parse(refer, Array.isArray(value) ? value[0] : value);
      }
    }
    return [properties, refers];
  }

  parse(fileName?: string, json?: any) {
    let data = json;
    if (!data && !this.json) {
      return;
    } else if (!data) {
      data = this.json;
    }
    let name = fileName;
    if (!name) {
      name = isDirectory(this.uri)
        ? "response"
        : this.uri.fsPath.replace(/(.*\/)*([^.]+).*/gi, "$2");
    }
    const [properties, refers] = this.getProperties(data);
    this.files.push({
      name: convertFileName(name),
      properties,
      refers,
    });
  }

  async write() {
    return Promise.all(
      this.files.map((file) => {
        const fileContent = composeFile(file);
        return writeFile(
          this.uri.with({
            path: path.resolve(
              this.uri.fsPath,
              `${isDirectory(this.uri) ? "." : ".."}/${file.name}.dart`
            ),
          }),
          fileContent
        );
      })
    );
  }
}
