import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Fetch all charities with optional filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');

    const supabase = await createClient();
    let query = supabase.from('charities').select('*');

    // Filter by featured
    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    // Search by name or description
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    query = query.order('name');

    const { data: charities, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch charities' },
        { status: 500 }
      );
    }

    return NextResponse.json({ charities });
  } catch (error) {
    console.error('Error fetching charities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new charity (admin only)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, image_url, website_url, is_featured, upcoming_events } = body;

    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Create charity
    const { data: charity, error } = await supabase
      .from('charities')
      .insert({
        name,
        description,
        image_url: image_url || null,
        website_url: website_url || null,
        is_featured: is_featured || false,
        upcoming_events: upcoming_events || [],
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create charity' },
        { status: 500 }
      );
    }

    return NextResponse.json({ charity }, { status: 201 });
  } catch (error) {
    console.error('Error creating charity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
