import { notFound } from "next/navigation";
import Link from "next/link";
import { MarketingNav } from "@/components/marketing/nav";
import { MarketingFooter } from "@/components/marketing/footer";
import { blogPosts, BLOG_BODIES } from "@/lib/blog-posts";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  const body = BLOG_BODIES[post.slug] ?? [post.excerpt];
  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <div className="bg-page-bg text-dark min-h-screen">
      <MarketingNav />
      <main className="max-w-page mx-auto px-8 pt-space-128 pb-space-96">
        <article className="max-w-[680px] mx-auto text-left">
          <div className="flex items-center gap-4 mb-8">
            <span className="font-ui text-ui-2xs uppercase tracking-[0.2em] text-amber font-bold">{post.category}</span>
            <span className="h-[1px] w-8 bg-border-subtle"></span>
            <span className="font-mono text-ui-xs text-light">{post.date}</span>
          </div>

          <h1 className="font-display text-4xl text-dark mb-8 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 pb-space-48 border-b-[0.5px] border-border-subtle mb-space-48">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-lighter flex items-center justify-center">
              <span className="font-ui font-bold text-mid">{post.author.slice(0, 2).toUpperCase()}</span>
            </div>
            <div>
              <p className="font-ui font-bold text-dark">{post.author}</p>
              <p className="font-ui text-light uppercase tracking-wider">Arthvahi Blog</p>
            </div>
          </div>

          <div className="space-y-8 leading-relaxed font-display text-xl text-dark">
            {body.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-16 pt-8 border-t-[0.5px] border-border-subtle">
            <h2 className="font-ui text-lg font-bold text-dark mb-6">Related reading</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {related.map((r) => (
                <Link key={r.slug} href={`/blog/${r.slug}`} className="block p-4 border border-border-subtle rounded-md hover:border-amber/40 transition-colors no-underline">
                  <p className="font-ui text-ui-2xs uppercase tracking-widest text-amber font-bold">{r.category}</p>
                  <p className="font-ui text-ui-sm font-semibold text-dark mt-2">{r.title}</p>
                </Link>
              ))}
            </div>
          </div>
        </article>
      </main>
      <MarketingFooter />
    </div>
  );
}
