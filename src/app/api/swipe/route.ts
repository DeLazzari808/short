import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Prediction odds
const PREDICTION_ODDS: Record<string, number> = {
  match: 2.5,
  no_match: 1.3,
  they_like: 1.8,
  they_pass: 1.5,
};

export async function POST(request: NextRequest) {
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
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {
              // Called from Server Component
            }
          },
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

    const { targetUserId, direction, prediction } = await request.json();

    if (!targetUserId || !direction) {
      return NextResponse.json(
        { error: 'targetUserId and direction are required' },
        { status: 400 }
      );
    }

    // Check if direction is valid
    if (!['like', 'pass'].includes(direction)) {
      return NextResponse.json(
        { error: 'Direction must be like or pass' },
        { status: 400 }
      );
    }

    // Check if user already swiped this profile
    const { data: existingSwipe } = await supabase
      .from('swipes')
      .select('*')
      .eq('swiper_id', user.id)
      .eq('target_user_id', targetUserId)
      .single();

    if (existingSwipe) {
      return NextResponse.json(
        { error: 'Already swiped this profile' },
        { status: 400 }
      );
    }

    // Get current user
    const { data: currentUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // If there's a prediction, deduct points and create prediction
    let predictionRecord = null;
    let pointsDeducted = 0;

    if (prediction && prediction.type) {
      if (prediction.pointsStaked > currentUser.points) {
        return NextResponse.json(
          { error: 'Insufficient points' },
          { status: 400 }
        );
      }

      const odds = PREDICTION_ODDS[prediction.type] || 1;
      pointsDeducted = prediction.pointsStaked;

      // Create prediction
      const { data: newPrediction, error: predictionError } = await supabase
        .from('predictions')
        .insert({
          predictor_id: user.id,
          target_user_id: targetUserId,
          prediction_type: prediction.type,
          points_staked: prediction.pointsStaked,
          odds,
          my_action: direction,
        })
        .select()
        .single();

      if (predictionError) {
        console.error('Prediction error:', predictionError);
        return NextResponse.json(
          { error: 'Failed to create prediction' },
          { status: 500 }
        );
      }

      predictionRecord = newPrediction;

      // Deduct points from user
      await supabase
        .from('users')
        .update({ points: currentUser.points - prediction.pointsStaked })
        .eq('id', user.id);

      // Create transaction record
      await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'stake',
          amount: -prediction.pointsStaked,
          description: `Prediction: ${prediction.type}`,
          reference_id: newPrediction.id,
        });
    }

    // Create the swipe
    const { data: swipe, error: swipeError } = await supabase
      .from('swipes')
      .insert({
        swiper_id: user.id,
        target_user_id: targetUserId,
        direction,
      })
      .select()
      .single();

    if (swipeError) {
      console.error('Swipe error:', swipeError);
      return NextResponse.json(
        { error: 'Failed to create swipe' },
        { status: 500 }
      );
    }

    // Check if there's a match (the other user has already liked us)
    const { data: theirSwipe } = await supabase
      .from('swipes')
      .select('*')
      .eq('swiper_id', targetUserId)
      .eq('target_user_id', user.id)
      .eq('direction', 'like')
      .single();

    const isMatch = theirSwipe !== null;
    let matchRecord = null;

    if (isMatch) {
      // Create match
      const { data: match } = await supabase
        .from('matches')
        .insert({
          user1_id: user.id,
          user2_id: targetUserId,
        })
        .select()
        .single();

      matchRecord = match;

      // If user made a prediction and it's a match, resolve it
      if (predictionRecord && prediction.type === 'match') {
        const earnedPoints = Math.round(prediction.pointsStaked * PREDICTION_ODDS.match);
        
        await supabase
          .from('predictions')
          .update({
            resolved: true,
            correct: true,
            points_earned: earnedPoints,
            resolved_at: new Date().toISOString(),
          })
          .eq('id', predictionRecord.id);

        // Add points to user
        await supabase
          .from('users')
          .update({ points: (currentUser.points - pointsDeducted) + earnedPoints })
          .eq('id', user.id);

        // Create transaction
        await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            type: 'earn',
            amount: earnedPoints,
            description: 'Prediction: Match!',
            reference_id: predictionRecord.id,
          });

        predictionRecord = { ...predictionRecord, correct: true, points_earned: earnedPoints };
      }
    } else if (predictionRecord) {
      // If there's no match yet, we need to wait for the other user to swipe
      // For now, resolve the prediction as "pending" - it will be resolved when the other user swipes
      // For this MVP, we'll use a random simulation for demonstration
      // In production, this would wait for the other user's action
    }

    // Calculate base points earned (for like/match without prediction)
    let pointsEarned = 0;
    if (isMatch) {
      pointsEarned = 10; // Match bonus
    } else if (direction === 'pass') {
      pointsEarned = 2; // Participation bonus for passing
    }

    // If user earned points (match), update their balance
    if (pointsEarned > 0) {
      const { data: updatedUser } = await supabase
        .from('users')
        .select('points')
        .eq('id', user.id)
        .single();

      if (updatedUser) {
        await supabase
          .from('users')
          .update({ points: updatedUser.points + pointsEarned })
          .eq('id', user.id);
      }
    }

    // Get target user for response
    const { data: targetUser } = await supabase
      .from('users')
      .select('id, display_name, age, bio, avatar_url')
      .eq('id', targetUserId)
      .single();

    return NextResponse.json({
      success: true,
      swipe,
      match: isMatch,
      matchRecord,
      prediction: predictionRecord,
      pointsEarned,
      targetUser: {
        id: targetUser?.id,
        name: targetUser?.display_name || 'Usuário',
        action: theirSwipe?.direction || null,
      },
    });
  } catch (error) {
    console.error('Error in swipe API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
