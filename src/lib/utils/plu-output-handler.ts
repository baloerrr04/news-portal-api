export function createPluError(message: string, code?: number) {
  return {
    message,
    code: code ?? 500,
  };
}
