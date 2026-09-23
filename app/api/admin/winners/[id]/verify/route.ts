import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

// POST - Verify or reject winner proof
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const { status, admin_notes } = await request.json();

    if (!status || !['verified', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be "verified" or "rejected"' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const updateData: any = {
      verification_status: status,
      admin_notes: admin_notes || null,
    };

    if (status === 'verified') {
      updateData.verified_at = new Date().toISOString();
    }

    const { data: winner, error } = await supabase
      .from('winners')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update verification status' },
        { status: 500 }
      );
    }

    return NextResponse.json({ winner });
  } catch (error: any) {
    console.error('Error verifying winner:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Admin access required' ? 403 : 500 }
    );
  }
}
