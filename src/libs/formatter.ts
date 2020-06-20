import { ParseArrayError } from "./errors";
import {
  convertClassName,
  convertFileName,
  convertPropertyName,
} from "./utils";
import { IGeneratedFile } from "./parser";

type IFormatter = (
  name: string,
  value?: any | any[],
  files?: IGeneratedFile[]
) => [string, string | null];

export const appendStringProperty: IFormatter = (name: string) => [
  `@BuiltValueField(wireName: '${name}')\nString get ${convertPropertyName(
    name
  )};`,
  null,
];

export const appendNumberProperty: IFormatter = (
  name: string,
  value: number
) => [
  `@BuiltValueField(wireName: '${name}')\n${
    Number.isInteger(value) ? "int" : "double"
  } get ${convertPropertyName(name)};`,
  null,
];

export const appendArrayProperty: IFormatter = (
  name: string,
  value: any[],
  files?: IGeneratedFile[]
) => {
  const types = Array.from(new Set(value.map((e) => typeof e)).values());

  if (types.length !== 1) {
    throw new ParseArrayError();
  }
  const type = types[0];
  const propertyName = convertPropertyName(name);

  let property: string = "";
  let refer: string | null = null;

  if (type === "string") {
    property = `@BuiltValueField(wireName: '${name}')\nBuiltList<String> get ${propertyName};`;
  } else if (type === "number") {
    property = `@BuiltValueField(wireName: '${name}')\nBuiltList<${
      Number.isInteger(value[0]) ? "int" : "double"
    }> get ${propertyName};`;
  } else if (type === "object") {
    property = `@BuiltValueField(wireName: '${name}')\nBuiltList<${convertClassName(
      name
    )}> get ${propertyName};`;
    refer = convertFileName(name, files);
  }
  return [property, refer];
};

export const appendObjectProperty = (
  name: string,
  _: any,
  files?: IGeneratedFile[]
) => {
  return [
    `@BuiltValueField(wireName: '${name}')\n${convertClassName(
      name
    )} get ${convertPropertyName(name)};`,
    convertFileName(name, files),
  ];
};
