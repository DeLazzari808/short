import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Prediction odds configuration
const PREDICTION_ODDS: Record<string, number> = {
  match: 2.5,
  no_match: 1.3,
  they_like: 1.8,
  they_pass: 1.5,
};

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

    // Get current user profile
    const { data: currentUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Get profiles the user hasn't swiped yet
    // First, get all users the current user has already swiped
    const { data: existingSwipes } = await supabase
      .from('swipes')
      .select('target_user_id')
      .eq('swiper_id', user.id);

    const swipedUserIds = existingSwipes?.map(s => s.target_user_id) || [];
    swipedUserIds.push(user.id); // Exclude self

    // Get profiles that haven't been swiped
    const { data: profiles, error: profilesError } = await supabase
      .from('users')
      .select(`
        id,
        display_name,
        age,
        bio,
        avatar_url,
        profile_photos (url, is_primary),
        user_interests (interest)
      `)
      .not('id', 'in', `(${swipedUserIds.map(id => `"${id}"`).join(',')})`)
      .limit(20);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return NextResponse.json(
        { error: 'Failed to fetch profiles' },
        { status: 500 }
      );
    }

    // Define types for the nested relations
    interface ProfilePhoto {
      url: string;
      is_primary: boolean;
    }
    
    interface UserInterest {
      interest: string;
    }
    
    interface Profile {
      id: string;
      display_name: string | null;
      age: number | null;
      bio: string | null;
      avatar_url: string | null;
      profile_photos: ProfilePhoto[] | null;
      user_interests: UserInterest[] | null;
    }

    // Transform profiles to match frontend interface
    const transformedProfiles = profiles?.map((profile: Profile) => {
      // Get primary photo or first available
      const photos = profile.profile_photos;
      const primaryPhoto = photos?.find(p => p.is_primary) || photos?.[0];
      const photoUrl = primaryPhoto?.url || profile.avatar_url;
      
      // Generate gradient if no photo
      const avatar = photoUrl 
        ? photoUrl 
        : `linear-gradient(135deg, hsl(${Math.random() * 360}, 75%, 55%), hsl(${(Math.random() * 360 + 30) % 360}, 85%, 45%))`;

      return {
        id: profile.id,
        name: profile.display_name || 'Usuário',
        age: profile.age || 25,
        bio: profile.bio || 'Sem bio',
        avatar,
        distance: `${Math.floor(Math.random() * 20) + 1} km`,
        interests: profile.user_interests?.map(i => i.interest) || [],
        verified: Math.random() > 0.6,
      };
    }) || [];

    // Return user info + profiles + prediction odds
    return NextResponse.json({
      user: {
        id: currentUser.id,
        points: currentUser.points,
        level: currentUser.level,
        xp: currentUser.xp,
        streak: 0, // TODO: Calculate streak
      },
      profiles: transformedProfiles,
      predictionOdds: PREDICTION_ODDS,
    });
  } catch (error) {
    console.error('Error in profiles API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
