export class FileLoadError extends Error {
  constructor() {
    super("Error: load file error");
  }
}

export class ResponseTypeError extends Error {
  constructor() {
    super("Error: response content type error");
  }
}

export class ParseError extends Error {
  constructor() {
    super("Error: parse json error");
  }
}

export class ParseArrayError extends Error {
  constructor() {
    super("Error: array can only have single type");
  }
}
