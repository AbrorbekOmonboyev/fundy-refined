/** Form checks shared by sign-up, login and settings. Must match supabase/config.toml. */

export const PASSWORD_MIN_LENGTH = 8;

export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

/** At least 8 characters with letters and digits (Supabase rule "letters_digits"). */
export const isStrongPassword = (password: string) =>
  password.length >= PASSWORD_MIN_LENGTH && /[A-Za-z]/.test(password) && /\d/.test(password);

export const isValidName = (name: string) => name.trim().length >= 2 && name.trim().length <= 120;
