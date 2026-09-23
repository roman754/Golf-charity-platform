import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatShortDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export function generateDrawNumbers(): number[] {
  const numbers = new Set<number>();
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

export function calculateMatches(userNumbers: number[], winningNumbers: number[]): number {
  return userNumbers.filter(num => winningNumbers.includes(num)).length;
}

export function getPrizeTier(matches: number): '3-match' | '4-match' | '5-match' | null {
  if (matches === 5) return '5-match';
  if (matches === 4) return '4-match';
  if (matches === 3) return '3-match';
  return null;
}

export function calculatePrizeDistribution(totalPool: number, jackpot: number = 0) {
  return {
    fiveMatch: totalPool * 0.40 + jackpot,
    fourMatch: totalPool * 0.35,
    threeMatch: totalPool * 0.25,
  };
}

export function isValidStablefordScore(score: number): boolean {
  return score >= 1 && score <= 45;
}

export function isSubscriptionActive(status: string, periodEnd: string | null): boolean {
  if (status !== 'active') return false;
  if (!periodEnd) return false;
  return new Date(periodEnd) > new Date();
}
