import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { generateDrawEntries, executeDraw } from '@/lib/draw-engine';

// POST - Execute draw (generate entries and calculate winners)
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    // Generate entries for all eligible users
    const entriesCount = await generateDrawEntries(id);

    if (entriesCount === 0) {
      return NextResponse.json(
        { error: 'No eligible participants found. Users need 5 scores to participate.' },
        { status: 400 }
      );
    }

    // Execute the draw
    const result = await executeDraw(id);

    return NextResponse.json({
      message: 'Draw executed successfully',
      entriesCount,
      result,
    });
  } catch (error: any) {
    console.error('Error executing draw:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
