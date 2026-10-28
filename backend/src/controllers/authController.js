import { getSupabase, isSupabaseReady, mockDb } from '../services/supabase/supabaseClient.js';
import { z } from 'zod';

const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(100)
});

export async function getMe(req, res, next) {
  try {
    const user = req.user;

    if (isSupabaseReady()) {
      const supabase = getSupabase();
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      return res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          displayName: profile?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0],
          createdAt: user.created_at || profile?.created_at
        }
      });
    }

    const profile = mockDb.profiles.get(user.id);
    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        displayName: profile?.display_name || 'Demo Student',
        createdAt: profile?.created_at || new Date().toISOString()
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const user = req.user;
    const validated = updateProfileSchema.parse(req.body);

    if (isSupabaseReady()) {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('profiles')
        .update({
          display_name: validated.displayName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return res.json({ success: true, data });
    }

    let profile = mockDb.profiles.get(user.id);
    if (!profile) {
      profile = { id: user.id, display_name: validated.displayName, created_at: new Date().toISOString() };
    } else {
      profile.display_name = validated.displayName;
      profile.updated_at = new Date().toISOString();
    }
    mockDb.profiles.set(user.id, profile);

    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
}
