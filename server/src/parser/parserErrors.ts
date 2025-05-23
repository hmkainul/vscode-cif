import { Token } from "./token";

export enum ParserErrorType {
  EmptyFile,
  EmptyDataBlock,
  MissingDataBlock,
  DataIdentifierMissing,
  DuplicateData,
  DuplicateTag,
  InvalidLoop,
  ValueMissing,
  UnexpectedValue,
  LoopValueMismatch,
  LoopValuesMissing,
  UnclosedSaveFrame,
  FatalError,
  LineTooLong,
  NonAsciiCharacter,
  ValueTooLong,
}

export enum ParserSeverity {
  Error,
  Warning,
}

const warnings = new Set<ParserErrorType>([ParserErrorType.EmptyFile]);

export function getSeverity(errorType: ParserErrorType): ParserSeverity {
  return warnings.has(errorType)
    ? ParserSeverity.Warning
    : ParserSeverity.Error;
}

export class ParserError {
  constructor(
    public type: ParserErrorType,
    public token?: Token,
    public message?: string,
  ) {}
}

export function formatParserError(error: ParserError): string {
  return (
    ParserErrorType[error.type]
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .toLowerCase() +
    " " +
    (error.token?.text ?? "") +
    " " +
    (error.message ?? "")
  ).trim();
}
