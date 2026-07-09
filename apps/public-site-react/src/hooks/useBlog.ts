import { useEffect, useState } from "react";
import type { BlogPost, PaginatedResult } from "@template/contracts";
import { createBlogClient } from "../lib/blogClient";

const blogClient = createBlogClient();

export function useBlogIndex(page = 1, search = "") {
  const [data, setData] = useState<PaginatedResult<BlogPost> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    start();

    async function start() {
      try {
        setLoading(true);
        const result = await blogClient.getPosts({
          page,
          limit: 6,
          search: search.trim() || undefined,
          publishedOnly: true
        });

        if (!cancelled) {
          setData(result);
          setError(null);
        }
      } catch (caught) {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "Failed to load blog.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    return () => {
      cancelled = true;
    };
  }, [page, search]);

  return { data, loading, error };
}

export function useBlogArticle(slug?: string) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setError("Blog post slug is missing.");
      return;
    }

    const slugValue = slug;
    let cancelled = false;

    start();

    async function start() {
      try {
        setLoading(true);
        const result = await blogClient.getPostBySlug(slugValue);
        if (!cancelled) {
          setPost(result);
          setError(null);
        }
      } catch (caught) {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "Failed to load article.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { post, loading, error };
}
