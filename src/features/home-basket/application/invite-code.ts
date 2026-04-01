export function normalizeInviteCode(value: string): string {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function getHouseholdInvitePrefix(householdName: string): string {
  const letters = householdName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return letters || 'HB';
}

export function buildInviteCode(householdName: string, token: string): string {
  return normalizeInviteCode(`${getHouseholdInvitePrefix(householdName)}-${token}`);
}
