export const getInitials = (name: string): string => {
  if (!name || !name.trim()) {
    return 'U';
  }

  return name
    .trim()
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';
};

