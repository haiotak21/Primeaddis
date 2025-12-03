import Link from "next/link";
import Image from "next/image";

function formatBlogDate(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${year}/${month}/${day} ${hours}:${minutes} ${ampm}`;
}
import { getAbsoluteBaseUrl } from "@/utils/helpers";
import { Clock } from "lucide-react";

async function getPosts() {
  const base = await getAbsoluteBaseUrl();
  const res = await fetch(`${base}/api/blog`, { cache: "no-store" });
  const data = await res.json();
  return data.posts as Array<any>;
}

export default async function BlogPage() {
  const posts = (await getPosts()) || [];
  const featured = posts[0];
  const recent = posts.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
          The Property Pulse
        </h1>
        <p className="text-lg text-gray-500">
          Market insights, design trends, and expert advice for your real estate
          journey.
        </p>
      </div>

      {featured && (
        <section className="mb-20">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-1 w-6 bg-blue-600 rounded-full"></div>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">
              Featured Article
            </h2>
          </div>

          <article className="group relative grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12 items-center cursor-pointer">
            <div className="relative aspect-[16/9] md:aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-lg">
              {featured.coverImage ? (
                <Image
                  src={featured.coverImage}
                  alt={featured.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gray-100" />
              )}
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300" />
            </div>

            <div className="flex flex-col justify-center space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 text-xs font-bold text-blue-600 bg-blue-50 rounded-full uppercase tracking-wider">
                  {featured.category || "News"}
                </span>
                <span className="text-gray-400 text-sm flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />{" "}
                  {featured.readTime || featured.read_time || "5 min read"}
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                <Link href={`/blog/${featured.slug}`}>{featured.title}</Link>
              </h2>

              <p className="text-gray-600 text-lg leading-relaxed line-clamp-3">
                {featured.excerpt}
              </p>

              <div className="pt-4 flex items-center gap-3">
                <Image
                  src={
                    (featured.author && featured.author.profileImage) ||
                    "/placeholder.svg"
                  }
                  alt={(featured.author && featured.author.name) || "Author"}
                  width={40}
                  height={40}
                  className="rounded-full border-2 border-white shadow-sm object-cover"
                  unoptimized
                />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900">
                    {(featured.author && featured.author.name) || "Author"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {(featured.author && featured.author.role) || "Writer"} •{" "}
                    {formatBlogDate(featured.publishedAt) || "Date"}
                  </span>
                </div>
              </div>
            </div>
          </article>
        </section>
      )}

      <section className="mb-20">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="h-1 w-6 bg-gray-300 rounded-full"></div>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">
              Recent Articles
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recent.map((post: any) => (
            <article
              key={post.slug}
              className="group flex flex-col h-full bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <div className="relative aspect-[3/2] overflow-hidden">
                {post.coverImage ? (
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100" />
                )}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 text-[10px] font-bold text-gray-900 bg-white/95 backdrop-blur-md rounded shadow-sm uppercase tracking-wide">
                    {post.category || "News"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col flex-grow p-5">
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                  <span>{formatBlogDate(post.publishedAt)}</span>
                  <span>•</span>
                  <span>{post.readTime || "4 min read"}</span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>

                <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-4 flex-grow">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    <Image
                      src={
                        (post.author && post.author.profileImage) ||
                        "/placeholder.svg"
                      }
                      alt={(post.author && post.author.name) || "Author"}
                      width={24}
                      height={24}
                      className="rounded-full"
                      unoptimized
                    />
                    <span className="text-xs font-medium text-gray-700">
                      {(post.author && post.author.name) || "Author"}
                    </span>
                  </div>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-blue-600 hover:text-blue-700 transition-colors p-1"
                  >
                    Read
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
