/**
 * Salary and compensation business calculations
 */

export interface StaffPayoutBreakdown {
  baseSalary: number;
  allowances: number;
  deductions: number;
  totalGross: number;
  netPayout: number;
}

/**
 * Calculates net staff payout with validation
 */
export function calculateStaffPayout(
  baseSalary: number,
  allowances: number = 0,
  deductions: number = 0
): StaffPayoutBreakdown {
  const safeBase = Math.max(0, baseSalary || 0);
  const safeAllowances = Math.max(0, allowances || 0);
  const safeDeductions = Math.max(0, deductions || 0);
  const totalGross = safeBase + safeAllowances;
  const netPayout = Math.max(0, totalGross - safeDeductions);

  return {
    baseSalary: safeBase,
    allowances: safeAllowances,
    deductions: safeDeductions,
    totalGross,
    netPayout,
  };
}

/**
 * Computes rider daily wage based on completed drop-offs and bonus thresholds
 */
export function calculateDailyWage(
  completedDrops: number,
  ratePerDrop: number,
  bonusThreshold: number = 50,
  bonusReward: number = 200
): { basePay: number; bonus: number; totalEarned: number } {
  const drops = Math.max(0, completedDrops || 0);
  const rate = Math.max(0, ratePerDrop || 0);
  const basePay = drops * rate;
  const bonus = drops >= bonusThreshold ? bonusReward : 0;

  return {
    basePay,
    bonus,
    totalEarned: basePay + bonus,
  };
}

