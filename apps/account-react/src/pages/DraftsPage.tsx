import { useEffect, useState } from "react";
import type { BlogPost } from "@template/contracts";
import { createBlogClient } from "../lib/blogClient";
import { useAuth } from "../state/AuthProvider";

const blogClient = createBlogClient();

export function DraftsPage() {
  const { tokens } = useAuth();
  const [drafts, setDrafts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tokens) {
      return;
    }

    blogClient
      .getDrafts(tokens.accessToken)
      .then((result) => {
        setDrafts(result);
        setError(null);
      })
      .catch((caught) => {
        setError(caught instanceof Error ? caught.message : "Failed to load drafts.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [tokens]);

  return (
    <section className="panel form-card">
      <div className="eyebrow">Protected blog boundary</div>
      <h2>Drafts stay behind auth.</h2>
      {loading && <p>Loading drafts...</p>}
      {error && <p className="error-text">{error}</p>}
      {!loading && !error && (
        <div className="draft-list">
          {drafts.map((draft) => (
            <article className="draft-item" key={draft.id}>
              <strong>{typeof draft.title === "string" ? draft.title : draft.title.en}</strong>
              <p className="muted">{typeof draft.excerpt === "string" ? draft.excerpt : draft.excerpt.en}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
