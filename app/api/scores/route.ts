import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isValidStablefordScore } from '@/lib/utils';

// GET - Fetch user's golf scores
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Fetch scores ordered by date (most recent first)
    const { data: scores, error } = await supabase
      .from('golf_scores')
      .select('*')
      .eq('user_id', user.id)
      .order('score_date', { ascending: false })
      .limit(5);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch scores' },
        { status: 500 }
      );
    }

    return NextResponse.json({ scores });
  } catch (error) {
    console.error('Error fetching scores:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new golf score
export async function POST(request: Request) {
  try {
    const { score, score_date } = await request.json();

    // Validate input
    if (!score || !score_date) {
      return NextResponse.json(
        { error: 'Score and date are required' },
        { status: 400 }
      );
    }

    if (!isValidStablefordScore(score)) {
      return NextResponse.json(
        { error: 'Score must be between 1 and 45' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if score already exists for this date
    const { data: existing } = await supabase
      .from('golf_scores')
      .select('id')
      .eq('user_id', user.id)
      .eq('score_date', score_date)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'A score already exists for this date. Please edit or delete it first.' },
        { status: 400 }
      );
    }

    // Insert new score (trigger will automatically limit to 5 scores)
    const { data: newScore, error: insertError } = await supabase
      .from('golf_scores')
      .insert({
        user_id: user.id,
        score,
        score_date,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create score' },
        { status: 500 }
      );
    }

    return NextResponse.json({ score: newScore }, { status: 201 });
  } catch (error) {
    console.error('Error creating score:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
