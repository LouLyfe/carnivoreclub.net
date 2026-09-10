'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function hostMeetup(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/members/meetups');

  const title = (formData.get('title') as string)?.trim();
  const location = (formData.get('location') as string)?.trim();
  const event_at = formData.get('event_at') as string;
  const description = (formData.get('description') as string) || null;
  const capacityRaw = formData.get('capacity') as string;
  const capacity = capacityRaw ? Number(capacityRaw) : null;

  if (!title || !location || !event_at) {
    redirect('/members/meetups?error=' + encodeURIComponent('Title, location, and date/time are required.'));
  }

  const { error } = await supabase.from('meetups').insert({
    host_id: user!.id,
    title,
    location,
    event_at: new Date(event_at).toISOString(),
    description,
    capacity,
    // status defaults to 'pending' — goes through the same admin review
    // queue as sellers/products before it's listed.
  });

  if (error) {
    redirect('/members/meetups?error=' + encodeURIComponent(error.message));
  }

  revalidatePath('/members/meetups');
  redirect('/members/meetups?success=' + encodeURIComponent("Meat Up submitted — it'll appear once approved."));
}

export async function rsvpMeetup(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/members/meetups');

  const meetup_id = formData.get('meetup_id') as string;

  const { error } = await supabase.from('meetup_rsvps').insert({ meetup_id, profile_id: user!.id });
  if (error && !error.message.includes('duplicate')) {
    redirect('/members/meetups?error=' + encodeURIComponent(error.message));
  }

  revalidatePath('/members/meetups');
  redirect('/members/meetups');
}

export async function cancelRsvp(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/members/meetups');

  const meetup_id = formData.get('meetup_id') as string;

  await supabase.from('meetup_rsvps').delete().eq('meetup_id', meetup_id).eq('profile_id', user!.id);

  revalidatePath('/members/meetups');
  redirect('/members/meetups');
}
