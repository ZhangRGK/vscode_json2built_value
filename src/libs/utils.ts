import { IGeneratedFile } from "./parser";
import * as inflected from "inflected";
import * as vscode from "vscode";
import { TextEncoder } from "util";
import { statSync } from "fs";

export const composeFile = (file: IGeneratedFile) => {
  const className = inflected.camelize(file.name);

  return `
library ${file.name};

import 'dart:convert';

import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';
  
${file.refers.map((ref) => `import '${ref}.dart';`).join("\n")}
  
part '${file.name}.g.dart';

abstract class ${className} implements Built<${className}, ${className}Builder> {
  ${className}._();

  factory ${className}([updates(${className}Builder b)]) = _$${className};

${file.properties
  .map((property) => {
    return `  ${property.replace("\n", "\n  ")}`;
  })
  .join("\n")}
  String toJson() {
    return json.encode(serializers.serializeWith(
        ${className}.serializer, this));
  }

  static ${className} fromJson(String jsonString) {
    return serializers.deserializeWith(
        ${className}.serializer, json.decode(jsonString));
  }

  static Serializer<${className}> get serializer =>
      _$${inflected.camelize(className, false)}Serializer;
}
  `;
};

export const writeFile = (uri: vscode.Uri, content: string) => {
  return new Promise((resolve, reject) => {
    try {
      const encoder = new TextEncoder();
      vscode.workspace.fs.writeFile(uri, encoder.encode(content)).then(resolve);
    } catch (e) {
      reject(e);
    }
  });
};

export const convertPropertyName = (name: string): string =>
  inflected.camelize(name, false);

export const convertClassName = (name: string): string =>
  inflected.camelize(inflected.singularize(name));

export const convertFileName = (
  name: string,
  files: IGeneratedFile[] = []
): string => {
  let fileName = inflected.underscore(inflected.singularize(name));
  let count = 0;

  while (files.findIndex((f) => f.name === fileName) >= 0) {
    fileName = `${name}${count === 0 ? "" : `_${count}`}`;
    count += 1;
  }
  return fileName;
};

export const checkUrlValid = (url: string) => /^http(s)?:\/\//gi.test(url);

export const isDirectory = (uri: vscode.Uri) =>
  statSync(uri.fsPath).isDirectory();
