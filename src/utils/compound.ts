import Decimal from 'decimal.js';

export interface CompoundParams {
  startingAmount: number;
  annualContribution: number;
  annualRate: number; // e.g. 0.10 for 10%
  years: number;
  frequency: 'annually' | 'quarterly' | 'monthly';
}

export interface YearlySnapshot {
  year: number;
  calendarYear: number; // current year + year index
  startBalance: number;
  contribution: number;
  interestEarned: number;
  endBalance: number;
  totalContributed: number; // cumulative
  totalInterest: number; // cumulative
}

export function calculateCompoundGrowth(params: CompoundParams): YearlySnapshot[] {
  const { startingAmount, annualContribution, annualRate, years, frequency } = params;
  const currentYear = new Date().getFullYear();

  // Determine number of periods per year
  const periodsPerYear = frequency === 'annually' ? 1 : frequency === 'quarterly' ? 4 : 12;
  const ratePerPeriod = new Decimal(annualRate).div(periodsPerYear);

  const snapshots: YearlySnapshot[] = [];

  let balance = new Decimal(startingAmount);
  let totalContributed = new Decimal(startingAmount);
  let totalInterest = new Decimal(0);

  for (let year = 0; year <= years; year++) {
    const startBalance = balance.toNumber();

    snapshots.push({
      year,
      calendarYear: currentYear + year,
      startBalance,
      contribution: year === 0 ? 0 : annualContribution,
      interestEarned: totalInterest.toNumber(),
      endBalance: balance.toNumber(),
      totalContributed: totalContributed.toNumber(),
      totalInterest: totalInterest.toNumber(),
    });

    if (year < years) {
      // Apply annual contribution
      balance = balance.plus(annualContribution);
      totalContributed = totalContributed.plus(annualContribution);

      // Apply compound interest for the year (periodsPerYear times)
      for (let period = 0; period < periodsPerYear; period++) {
        const interestThisPeriod = balance.times(ratePerPeriod);
        balance = balance.plus(interestThisPeriod);
        totalInterest = totalInterest.plus(interestThisPeriod);
      }
    }
  }

  return snapshots;
}

export function getCompoundingAccelerationYear(snapshots: YearlySnapshot[]): number | null {
  // Find the year where interest earned in that year exceeds annual contribution
  for (let i = 1; i < snapshots.length; i++) {
    const prevSnapshot = snapshots[i - 1];
    const currSnapshot = snapshots[i];
    const interestEarnedThisYear = currSnapshot.interestEarned - prevSnapshot.interestEarned;
    const contributionThisYear = currSnapshot.contribution;

    if (interestEarnedThisYear > contributionThisYear && contributionThisYear > 0) {
      return currSnapshot.year;
    }
  }

  return null;
}
