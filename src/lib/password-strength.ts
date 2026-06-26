export type PasswordStrength = 'weak' | 'fair' | 'strong';

export function getPasswordStrength(password: string): PasswordStrength {
  if (password.length < 6) return 'weak';
  if (password.length < 12) {
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    return hasSpecial ? 'fair' : 'weak';
  }
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const strength = [hasUppercase, hasLowercase, hasNumber, hasSpecial].filter(
    Boolean,
  ).length;
  return strength >= 3 ? 'strong' : 'fair';
}

export function getPasswordStrengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case 'weak':
      return '#EF4444';
    case 'fair':
      return '#F59E0B';
    case 'strong':
      return '#10B981';
  }
}

export function getPasswordStrengthLabel(strength: PasswordStrength): string {
  switch (strength) {
    case 'weak':
      return 'Weak';
    case 'fair':
      return 'Fair';
    case 'strong':
      return 'Strong';
  }
}
