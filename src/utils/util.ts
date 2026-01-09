export function getErrorMsg(err: unknown): string {
  let errorMessage = 'Ошибка при обновлении данных';

  if (err instanceof Error) {
    errorMessage = err.message;
  } else if (typeof err === 'string') {
    errorMessage = err;
  }
  return errorMessage;
}
