'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function createPost(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/members/feed');

  const body = (formData.get('body') as string)?.trim();
  if (!body) {
    redirect('/members/feed?error=' + encodeURIComponent('Write something before posting.'));
  }

  const { error } = await supabase.from('community_posts').insert({ author_id: user!.id, body });
  if (error) {
    redirect('/members/feed?error=' + encodeURIComponent(error.message));
  }

  revalidatePath('/members/feed');
  redirect('/members/feed');
}

export async function createComment(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/members/feed');

  const post_id = formData.get('post_id') as string;
  const body = (formData.get('body') as string)?.trim();
  if (!body || !post_id) {
    redirect('/members/feed?error=' + encodeURIComponent('Write a reply before submitting.'));
  }

  const { error } = await supabase.from('community_comments').insert({ post_id, author_id: user!.id, body });
  if (error) {
    redirect('/members/feed?error=' + encodeURIComponent(error.message));
  }

  revalidatePath('/members/feed');
  redirect('/members/feed');
}
