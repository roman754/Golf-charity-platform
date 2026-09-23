import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { publishDraw } from '@/lib/draw-engine';

// POST - Publish draw results
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    await publishDraw(id);

    return NextResponse.json({
      message: 'Draw published successfully',
    });
  } catch (error: any) {
    console.error('Error publishing draw:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
