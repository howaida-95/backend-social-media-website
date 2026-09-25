export const parseDurationToMs = (expiresIn: string): number => {
  const match = /^(\d+)([smhd])$/i.exec(expiresIn.trim());
  if (!match) {
    return 60 * 60 * 1000;
  }

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return value * (multipliers[unit] || 60 * 60 * 1000);
};
