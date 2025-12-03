"use client";

import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Clock,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Bookmark,
} from "lucide-react";

interface Author {
  name: string;
  role?: string;
  profileImage?: string;
}

export interface BlogPost {
  title: string;
  excerpt?: string;
  content?: string;
  category?: string;
  imageUrl?: string;
  coverImage?: string;
  publishedAt?: string;
  readTime?: string;
  author?: Author;
}

interface BlogDetailProps {
  post: BlogPost;
}

const BlogDetail: React.FC<BlogDetailProps> = ({ post }) => {
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
  const router = useRouter();
  const [bookmarked, setBookmarked] = useState(false);

  const onBack = useCallback(() => router.back(), [router]);

  const onToggleBookmark = useCallback(() => {
    // Placeholder: persist bookmark to server if available
    setBookmarked((v) => !v);
    // TODO: call API to persist bookmark if endpoint exists
  }, []);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const onShare = useCallback(() => {
    if (navigator.share) {
      navigator
        .share({ title: post.title, text: post.excerpt, url: shareUrl })
        .catch(() => {});
      return;
    }
    // fallback: copy url
    void navigator.clipboard?.writeText(shareUrl);
    alert("Link copied to clipboard");
  }, [post.title, post.excerpt, shareUrl]);

  const openSocial = useCallback(
    (provider: "facebook" | "twitter" | "linkedin") => {
      const url = encodeURIComponent(shareUrl);
      const title = encodeURIComponent(post.title || "");
      let href = "";
      if (provider === "facebook")
        href = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
      if (provider === "twitter")
        href = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
      if (provider === "linkedin")
        href = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
      window.open(href, "_blank", "noopener,noreferrer");
    },
    [post.title, shareUrl]
  );

  return (
    <div className="bg-white min-h-screen animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 h-16 flex items-center">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 font-medium hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Back to Articles</span>
        </button>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          {post.category ? (
            <div className="inline-flex items-center justify-center px-3 py-1 mb-6 text-sm font-bold text-blue-600 bg-blue-50 rounded-full uppercase tracking-wider">
              {post.category}
            </div>
          ) : null}

          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
            {post.title}
          </h1>

          {post.excerpt ? (
            <p className="text-xl text-gray-500 mb-8 max-w-2xl mx-auto leading-relaxed">
              {post.excerpt}
            </p>
          ) : null}

          <div className="flex items-center justify-center gap-6 border-t border-b border-gray-100 py-6">
            <div className="flex items-center gap-3 text-left">
              {post.author?.profileImage ? (
                <Image
                  src={post.author.profileImage}
                  alt={post.author.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full ring-2 ring-white shadow-sm object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-sm text-gray-600">
                  {post.author?.name?.[0] || "A"}
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-bold text-gray-900">
                  {post.author?.name}
                </span>
                <span className="text-sm text-gray-500">
                  {post.author?.role}
                </span>
              </div>
            </div>

            <div className="hidden sm:block w-px h-10 bg-gray-200"></div>

            <div className="text-sm text-gray-500 text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-gray-900">
                  {formatBlogDate(post.publishedAt)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Clock className="w-4 h-4" />
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-12 rounded-2xl overflow-hidden shadow-2xl aspect-video relative group">
          {post.coverImage || post.imageUrl ? (
            <Image
              src={post.coverImage || post.imageUrl}
              alt={post.title}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gray-100" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        </div>

        <div className="prose prose-lg md:prose-xl prose-blue mx-auto text-gray-700 leading-relaxed">
          <div dangerouslySetInnerHTML={{ __html: post.content || "" }} />
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <h4 className="font-bold text-gray-900 text-lg mb-1">
                Enjoyed this article?
              </h4>
              <p className="text-gray-500">Share it with your network.</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => openSocial("facebook")}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
              >
                <Facebook className="w-4 h-4" />
                Share
              </button>
              <button
                onClick={() => openSocial("twitter")}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500 text-white font-medium hover:bg-sky-600 transition-colors"
              >
                <Twitter className="w-4 h-4" />
                Tweet
              </button>
              <button
                onClick={() => openSocial("linkedin")}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-800 text-white font-medium hover:bg-blue-900 transition-colors"
              >
                <Linkedin className="w-4 h-4" />
                Post
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogDetail;
