export class FileLoadError extends Error {
  constructor() {
    super("Can't load file.");
  }
}

export class ResponseTypeError extends Error {
  constructor(url: string) {
    super(`Can't get json response from url: ${url}.`);
  }
}

export class ParseJSONError extends Error {
  constructor() {
    super(
      `Something went wrong while parsing JSON, please check the JSON content.`
    );
  }
}

export class ParseArrayError extends Error {
  constructor() {
    super("Array can only have single type element");
  }
}
