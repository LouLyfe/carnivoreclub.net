import { createClient } from '@/lib/supabase/server';
import { createPost, createComment } from './actions';
import FormMessage from '@/components/FormMessage';
import SubmitButton from '@/components/form/SubmitButton';

export default async function MembersFeedPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const supabase = createClient();

  const [{ data: posts }, { data: comments }] = await Promise.all([
    supabase
      .from('community_posts')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false }),
    supabase
      .from('community_comments')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: true }),
  ]);

  const commentsByPost = new Map<string, any[]>();
  for (const c of comments ?? []) {
    const list = commentsByPost.get(c.post_id) ?? [];
    list.push(c);
    commentsByPost.set(c.post_id, list);
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Members feed</h1>
      <p className="mt-2 text-sm text-charcoal/70">Post a question, a win, a recommendation — anything carnivore.</p>

      <form action={createPost} className="mt-6 flex flex-col gap-3 rounded-lg border border-charcoal/10 bg-white p-4">
        <textarea
          name="body"
          rows={3}
          required
          placeholder="What's on your mind?"
          className="rounded-md border border-charcoal/20 px-3 py-2 text-sm"
        />
        <FormMessage error={searchParams.error} />
        <div>
          <SubmitButton>Post</SubmitButton>
        </div>
      </form>

      <div className="mt-10 flex flex-col gap-6">
        {posts?.map((p: any) => (
          <div key={p.id} className="rounded-lg border border-charcoal/10 bg-white p-5">
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-medium">{p.profiles?.full_name ?? 'A member'}</p>
              <p className="text-xs text-charcoal/50">{new Date(p.created_at).toLocaleString()}</p>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-charcoal/90">{p.body}</p>

            {!!commentsByPost.get(p.id)?.length && (
              <div className="mt-4 flex flex-col gap-3 border-t border-charcoal/10 pt-4">
                {commentsByPost.get(p.id)!.map((c) => (
                  <div key={c.id} className="text-sm">
                    <span className="font-medium">{c.profiles?.full_name ?? 'A member'}</span>{' '}
                    <span className="text-charcoal/50">{new Date(c.created_at).toLocaleString()}</span>
                    <p className="text-charcoal/80">{c.body}</p>
                  </div>
                ))}
              </div>
            )}

            <form action={createComment} className="mt-4 flex gap-2">
              <input type="hidden" name="post_id" value={p.id} />
              <input
                name="body"
                placeholder="Reply…"
                className="flex-1 rounded-md border border-charcoal/20 px-3 py-1.5 text-sm"
              />
              <button className="rounded-md border border-charcoal/20 px-3 py-1.5 text-sm hover:bg-charcoal/5">
                Reply
              </button>
            </form>
          </div>
        ))}
        {!posts?.length && <p className="text-sm text-charcoal/60">No posts yet — be the first to say something.</p>}
      </div>
    </div>
  );
}
