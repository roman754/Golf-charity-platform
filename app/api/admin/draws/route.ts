import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';

// GET - List all draws
export async function GET() {
  try {
    await requireAdmin();

    const supabase = await createClient();
    const { data: draws, error } = await supabase
      .from('draws')
      .select('*')
      .order('draw_date', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch draws' },
        { status: 500 }
      );
    }

    return NextResponse.json({ draws });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Admin access required' ? 403 : 500 }
    );
  }
}

// POST - Create new draw
export async function POST(request: Request) {
  try {
    await requireAdmin();

    const { draw_date, draw_type, jackpot_amount } = await request.json();

    if (!draw_date) {
      return NextResponse.json(
        { error: 'Draw date is required' },
        { status: 400 }
      );
    }

    const date = new Date(draw_date);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const supabase = await createClient();

    // Check if draw already exists for this date
    const { data: existing } = await supabase
      .from('draws')
      .select('id')
      .eq('draw_date', draw_date)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Draw already exists for this date' },
        { status: 400 }
      );
    }

    // Get previous unclaimed jackpot if any
    let previousJackpot = jackpot_amount || 0;
    
    if (!jackpot_amount) {
      const { data: lastDraw } = await supabase
        .from('draws')
        .select('jackpot_amount, winning_numbers')
        .eq('status', 'completed')
        .order('draw_date', { ascending: false })
        .limit(1)
        .single();

      if (lastDraw && lastDraw.jackpot_amount > 0) {
        // Check if there were 5-match winners
        const { data: fiveMatchWinners } = await supabase
          .from('winners')
          .select('id')
          .eq('match_type', '5-match')
          .limit(1);

        if (!fiveMatchWinners || fiveMatchWinners.length === 0) {
          previousJackpot = lastDraw.jackpot_amount;
        }
      }
    }

    // Create draw
    const { data: draw, error } = await supabase
      .from('draws')
      .insert({
        draw_date,
        draw_month: month,
        draw_year: year,
        draw_type: draw_type || 'random',
        status: 'pending',
        winning_numbers: [],
        jackpot_amount: previousJackpot,
        total_participants: 0,
        total_pool_amount: 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create draw' },
        { status: 500 }
      );
    }

    return NextResponse.json({ draw }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Admin access required' ? 403 : 500 }
    );
  }
}
