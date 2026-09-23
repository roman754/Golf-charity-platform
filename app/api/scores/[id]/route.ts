import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isValidStablefordScore } from '@/lib/utils';

// PUT - Update golf score
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { score, score_date } = await request.json();

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

    // Check if another score exists for this date (excluding current score)
    const { data: existing } = await supabase
      .from('golf_scores')
      .select('id')
      .eq('user_id', user.id)
      .eq('score_date', score_date)
      .neq('id', id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'A score already exists for this date' },
        { status: 400 }
      );
    }

    // Update score
    const { data: updatedScore, error: updateError } = await supabase
      .from('golf_scores')
      .update({ score, score_date })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update score' },
        { status: 500 }
      );
    }

    if (!updatedScore) {
      return NextResponse.json(
        { error: 'Score not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ score: updatedScore });
  } catch (error) {
    console.error('Error updating score:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete golf score
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { error: deleteError } = await supabase
      .from('golf_scores')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete score' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting score:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
