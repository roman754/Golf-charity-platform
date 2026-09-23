import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST - Upload winner proof image
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { proof_image_url } = await request.json();

    if (!proof_image_url) {
      return NextResponse.json(
        { error: 'Proof image URL is required' },
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

    // Update winner record with proof
    const { data: winner, error } = await supabase
      .from('winners')
      .update({
        proof_image_url,
        verification_status: 'pending',
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to upload proof' },
        { status: 500 }
      );
    }

    if (!winner) {
      return NextResponse.json(
        { error: 'Winner record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ winner });
  } catch (error) {
    console.error('Error uploading proof:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
