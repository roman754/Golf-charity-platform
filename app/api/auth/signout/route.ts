import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

export async function POST(request: Request) {
  const supabase = await createClient();
  
  await supabase.auth.signOut();
  
  // Redirect to homepage after sign out
  return NextResponse.redirect(new URL('/', request.url));
}
