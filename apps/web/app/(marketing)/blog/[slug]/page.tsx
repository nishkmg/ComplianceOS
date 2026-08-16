import { notFound } from "next/navigation";
import Link from "next/link";
import { MarketingNav } from "@/components/marketing/nav";
import { MarketingFooter } from "@/components/marketing/footer";
import { blogPosts, BLOG_BODIES } from "@/lib/blog-posts";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

function cleanParagraph(text: string) {
  return text.replace(/ \u2014 /g, ", ");
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  const body = (BLOG_BODIES[post.slug] ?? [post.excerpt]).map(cleanParagraph);
  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <div className="bg-page-bg text-dark font-ui antialiased min-h-screen">
      <MarketingNav />
      <main id="main-content" className="max-w-[1320px] mx-auto px-8 pt-space-128 pb-space-96">
        <article className="max-w-[65ch] mx-auto text-left">
          <div className="flex items-center gap-4 mb-8">
            <span className="font-mono text-ui-2xs uppercase tracking-[0.22em] text-amber font-semibold">
              {post.category}
            </span>
            <span className="h-px w-8 bg-border-subtle" aria-hidden="true"></span>
            <span className="font-mono text-ui-xs text-light">{post.date}</span>
          </div>

          <h1 className="font-display text-display-xl text-dark mb-8 leading-[1.1] tracking-tight text-balance">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 pb-space-48 border-b border-border-subtle mb-space-48">
            <div className="w-12 h-12 rounded-full bg-section-muted flex items-center justify-center">
              <span className="font-mono text-mono-sm text-mid">
                {post.author.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-ui text-ui-sm font-semibold text-dark">{post.author}</p>
              <p className="font-mono text-ui-2xs uppercase tracking-widest text-light">
                Arthvahi Blog
              </p>
            </div>
          </div>

          <div className="space-y-8 font-ui text-ui-lg text-mid leading-relaxed">
            {body.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-16 pt-8 border-t border-border-subtle">
            <h2 className="font-mono text-mono-md uppercase tracking-tighter text-dark mb-2">
              Related reading
            </h2>
            <div className="divide-y divide-border-subtle border-b border-border-subtle">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="group block py-5 no-underline"
                >
                  <div className="flex items-baseline justify-between gap-6">
                    <p className="font-display text-display-lg text-dark leading-snug group-hover:text-amber transition-colors">
                      {r.title}
                    </p>
                    <span
                      className="font-mono text-ui-2xs uppercase tracking-widest text-amber whitespace-nowrap"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </div>
                  <p className="font-mono text-ui-2xs uppercase tracking-widest text-light mt-2">
                    {r.category} · {r.date}
                  </p>
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
