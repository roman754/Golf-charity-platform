import { generateDrawNumbers, calculateMatches, getPrizeTier } from './utils';
import { createAdminClient } from './supabase/server';

export interface DrawResult {
  drawId: string;
  winningNumbers: number[];
  winners: {
    userId: string;
    entryId: string;
    matchType: '3-match' | '4-match' | '5-match';
    prizeAmount: number;
    userNumbers: number[];
  }[];
  prizeDistribution: {
    fiveMatch: number;
    fourMatch: number;
    threeMatch: number;
  };
  jackpotRollover: number;
}

export async function generateDrawEntries(drawId: string): Promise<number> {
  const supabase = createAdminClient();

  const { data: subscribers } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('status', 'active');

  if (!subscribers || subscribers.length === 0) {
    return 0;
  }

  let entriesCreated = 0;

  for (const sub of subscribers) {
    const { data: scores } = await supabase
      .from('golf_scores')
      .select('score')
      .eq('user_id', sub.user_id)
      .order('score_date', { ascending: false })
      .limit(5);

    if (scores && scores.length === 5) {
      const entryNumbers = scores.map(s => s.score).sort((a, b) => a - b);

      const { error } = await supabase
        .from('draw_entries')
        .insert({
          draw_id: drawId,
          user_id: sub.user_id,
          entry_numbers: entryNumbers,
          matches_count: 0,
        });

      if (!error) {
        entriesCreated++;
      }
    }
  }

  return entriesCreated;
}

export async function executeDraw(
  drawId: string,
  drawType: 'random' | 'algorithmic' = 'random'
): Promise<DrawResult> {
  const supabase = createAdminClient();

  const winningNumbers = drawType === 'random' 
    ? generateDrawNumbers() 
    : await generateAlgorithmicNumbers(drawId);

  const { data: entries } = await supabase
    .from('draw_entries')
    .select('*')
    .eq('draw_id', drawId);

  if (!entries || entries.length === 0) {
    throw new Error('No entries found for this draw');
  }

  const entriesWithMatches = entries.map(entry => ({
    ...entry,
    matches: calculateMatches(entry.entry_numbers, winningNumbers),
  }));

  for (const entry of entriesWithMatches) {
    await supabase
      .from('draw_entries')
      .update({ matches_count: entry.matches })
      .eq('id', entry.id);
  }

  const fiveMatches = entriesWithMatches.filter(e => e.matches === 5);
  const fourMatches = entriesWithMatches.filter(e => e.matches === 4);
  const threeMatches = entriesWithMatches.filter(e => e.matches === 3);

  const { data: draw } = await supabase
    .from('draws')
    .select('jackpot_amount')
    .eq('id', drawId)
    .single();

  const currentJackpot = draw?.jackpot_amount || 0;

  // Prize pool: $10 per entry
  const totalPool = entries.length * 10;

  const fiveMatchPool = totalPool * 0.40;
  const fourMatchPool = totalPool * 0.35;
  const threeMatchPool = totalPool * 0.25;

  const winners: DrawResult['winners'] = [];
  let jackpotRollover = 0;

  // 5-match winners get their share + jackpot
  if (fiveMatches.length > 0) {
    const prizePerWinner = (fiveMatchPool + currentJackpot) / fiveMatches.length;
    fiveMatches.forEach(entry => {
      winners.push({
        userId: entry.user_id,
        entryId: entry.id,
        matchType: '5-match',
        prizeAmount: Math.round(prizePerWinner * 100) / 100,
        userNumbers: entry.entry_numbers,
      });
    });
  } else {
    jackpotRollover = currentJackpot + fiveMatchPool;
  }

  if (fourMatches.length > 0) {
    const prizePerWinner = fourMatchPool / fourMatches.length;
    fourMatches.forEach(entry => {
      winners.push({
        userId: entry.user_id,
        entryId: entry.id,
        matchType: '4-match',
        prizeAmount: Math.round(prizePerWinner * 100) / 100,
        userNumbers: entry.entry_numbers,
      });
    });
  }

  if (threeMatches.length > 0) {
    const prizePerWinner = threeMatchPool / threeMatches.length;
    threeMatches.forEach(entry => {
      winners.push({
        userId: entry.user_id,
        entryId: entry.id,
        matchType: '3-match',
        prizeAmount: Math.round(prizePerWinner * 100) / 100,
        userNumbers: entry.entry_numbers,
      });
    });
  }

  for (const winner of winners) {
    await supabase.from('winners').insert({
      draw_id: drawId,
      user_id: winner.userId,
      entry_id: winner.entryId,
      match_type: winner.matchType,
      prize_amount: winner.prizeAmount,
      verification_status: 'pending',
      payment_status: 'pending',
    });
  }

  await supabase
    .from('draws')
    .update({
      winning_numbers: winningNumbers,
      total_pool_amount: totalPool,
      total_participants: entries.length,
    })
    .eq('id', drawId);

  return {
    drawId,
    winningNumbers,
    winners,
    prizeDistribution: {
      fiveMatch: fiveMatchPool + currentJackpot,
      fourMatch: fourMatchPool,
      threeMatch: threeMatchPool,
    },
    jackpotRollover,
  };
}

/**
 * Weighted random number generation based on score frequency
 * More frequent scores have higher probability of being selected
 */
async function generateAlgorithmicNumbers(drawId: string): Promise<number[]> {
  const supabase = createAdminClient();

  const { data: entries } = await supabase
    .from('draw_entries')
    .select('entry_numbers')
    .eq('draw_id', drawId);

  if (!entries || entries.length === 0) {
    return generateDrawNumbers();
  }

  const frequency: Record<number, number> = {};
  entries.forEach(entry => {
    entry.entry_numbers.forEach((num: number) => {
      frequency[num] = (frequency[num] || 0) + 1;
    });
  });

  const weightedNumbers: number[] = [];
  for (let num = 1; num <= 45; num++) {
    const weight = frequency[num] || 1;
    for (let i = 0; i < weight; i++) {
      weightedNumbers.push(num);
    }
  }

  const selected = new Set<number>();
  while (selected.size < 5) {
    const index = Math.floor(Math.random() * weightedNumbers.length);
    selected.add(weightedNumbers[index]);
  }

  return Array.from(selected).sort((a, b) => a - b);
}

export async function publishDraw(drawId: string): Promise<void> {
  const supabase = createAdminClient();

  await supabase
    .from('draws')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
    })
    .eq('id', drawId);
}

export async function completeDraw(drawId: string): Promise<void> {
  const supabase = createAdminClient();

  await supabase
    .from('draws')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', drawId);
}
