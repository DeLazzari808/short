import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {},
        },
      }
    );

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile with stats
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError || !userProfile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get swipe history
    const { data: swipeHistory } = await supabase
      .from('swipes')
      .select(`
        id,
        direction,
        created_at,
        target_user:users!swipes_target_user_id_fkey(
          id,
          display_name,
          age,
          avatar_url
        )
      `)
      .eq('swiper_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    // Get matches
    const { data: matches } = await supabase
      .from('matches')
      .select(`
        id,
        created_at,
        user1:users!matches_user1_id_fkey(id, display_name, avatar_url),
        user2:users!matches_user2_id_fkey(id, display_name, avatar_url)
      `)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(20);

    // Get transactions
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    // Get resolved predictions
    const { data: predictions } = await supabase
      .from('predictions')
      .select('*')
      .eq('predictor_id', user.id)
      .eq('resolved', true)
      .order('created_at', { ascending: false })
      .limit(50);

    // Calculate stats
    const totalSwipes = swipeHistory?.length || 0;
    const matchCount = matches?.length || 0;
    const resolvedPredictions = predictions?.length || 0;
    const correctPredictions = predictions?.filter(p => p.correct).length || 0;
    const predictionAccuracy = resolvedPredictions > 0 
      ? Math.round((correctPredictions / resolvedPredictions) * 100) 
      : 0;

    return NextResponse.json({
      user: {
        id: userProfile.id,
        email: userProfile.email,
        username: userProfile.username,
        display_name: userProfile.display_name,
        avatar_url: userProfile.avatar_url,
        bio: userProfile.bio,
        age: userProfile.age,
        points: userProfile.points,
        level: userProfile.level,
        xp: userProfile.xp,
        created_at: userProfile.created_at,
      },
      stats: {
        totalSwipes,
        matches: matchCount,
        matchRate: totalSwipes > 0 ? Math.round((matchCount / totalSwipes) * 100) : 0,
        predictions: resolvedPredictions,
        predictionAccuracy,
      },
      swipeHistory: swipeHistory || [],
      matches: matches || [],
      transactions: transactions || [],
      predictions: predictions || [],
    });
  } catch (error) {
    console.error('Error in user/me API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
