/** Turns a Firebase error into wording that is safe and useful to show a visitor. Raw codes are never displayed. */
export function friendlySubmitError(err: unknown): string {
  const code = typeof err === 'object' && err !== null && 'code' in err ? String((err as { code: unknown }).code) : '';
  switch (code) {
    case 'permission-denied':
      return 'The registration system did not accept this submission. Please check your answers and try again, or contact us.';
    case 'unavailable':
    case 'deadline-exceeded':
    case 'cancelled':
      return 'We could not reach the registration system. Check your internet connection and try again.';
    case 'resource-exhausted':
      return 'The registration system is busy right now. Please try again in a little while.';
    case 'app/not-configured':
      return 'Online registration is not switched on yet. Please contact us to register.';
    default:
      return 'Something went wrong while sending your application.';
  }
}
