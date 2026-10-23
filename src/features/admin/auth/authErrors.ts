/** Wording for sign-in problems. Deliberately generic: it never says whether an email exists. */
export function friendlyAuthError(err: unknown): string {
  const code = typeof err === 'object' && err !== null && 'code' in err ? String((err as { code: unknown }).code) : '';
  switch (code) {
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a few minutes, or reset your password.';
    case 'auth/network-request-failed':
      return 'Could not reach the sign-in service. Check your internet connection and try again.';
    case 'auth/user-disabled':
      return 'This account cannot sign in. Contact the person who manages admin access.';
    case 'app/not-configured':
      return 'Firebase is not configured for this site yet.';
    default:
      // invalid-credential, wrong-password, user-not-found, invalid-email ...
      return 'The email or password is not correct.';
  }
}
