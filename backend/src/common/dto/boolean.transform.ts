import type { TransformFnParams } from 'class-transformer';

export function toOptionalBoolean({ value }: TransformFnParams): boolean | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  return value === true || value === 'true' || value === 1 || value === '1';
}
