import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { entities } from "@/api/entities";

export default function ReviewSection({ product }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ rating: 5, title: "", content: "", reviewer_name: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [product.id]);

  const loadReviews = async () => {
    try {
      const data = await entities.Review.filter({ product_id: product.id });
      setReviews(data);
    } catch {
      /* prototype */
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await entities.Review.create({
        product_id: product.id,
        product_name: product.name,
        rating: formData.rating,
        title: formData.title,
        content: formData.content,
        reviewer_name: formData.reviewer_name || "Anonymous",
      });
      setFormData({ rating: 5, title: "", content: "", reviewer_name: "" });
      setShowForm(false);
      loadReviews();
    } catch {
      /* prototype */
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "0";

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-heading font-light mb-6">Customer Reviews</h2>

      {/* Summary */}
      <div className="flex items-center gap-6 mb-6 p-5 bg-accent/40 rounded-2xl">
        <div className="text-center">
          <p className="text-4xl font-heading font-semibold">{avgRating}</p>
          <div className="flex gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                size={14}
                className={n <= Math.round(parseFloat(avgRating)) ? "fill-gold text-gold" : "text-border"}
              />
            ))}
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{reviews.length} {reviews.length === 1 ? "review" : "reviews"}</p>
          <p className="text-xs text-muted-foreground mt-1">Share your experience and help others find their perfect REVE.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 bg-blush text-white rounded-full text-sm font-medium hover:bg-blush/90 transition-colors whitespace-nowrap"
        >
          Write a Review
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-5 bg-white rounded-2xl border border-border mb-6 space-y-4 animate-fade-in">
          <div>
            <label className="text-sm font-medium mb-2 block">Your Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: n })}
                  className="p-1"
                >
                  <Star
                    size={24}
                    className={n <= formData.rating ? "fill-gold text-gold" : "text-border"}
                  />
                </button>
              ))}
            </div>
          </div>
          <input
            type="text"
            placeholder="Your name (optional)"
            value={formData.reviewer_name}
            onChange={(e) => setFormData({ ...formData, reviewer_name: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-cream/50 text-sm focus:outline-none focus:ring-2 focus:ring-blush/40"
          />
          <input
            type="text"
            required
            placeholder="Review title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-cream/50 text-sm focus:outline-none focus:ring-2 focus:ring-blush/40"
          />
          <textarea
            required
            rows={4}
            placeholder="Tell us what you think..."
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-cream/50 text-sm focus:outline-none focus:ring-2 focus:ring-blush/40 resize-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-foreground text-background rounded-full text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      )}

      {/* Reviews list */}
      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-8">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-sm text-muted-foreground mb-2">No reviews yet — be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="p-5 bg-white rounded-2xl border border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blush/15 flex items-center justify-center text-sm font-medium text-blush">
                    {review.reviewer_name?.[0]?.toUpperCase() || "A"}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{review.reviewer_name}</p>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          size={12}
                          className={n <= review.rating ? "fill-gold text-gold" : "text-border"}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(review.created_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
              {review.title && <p className="text-sm font-medium mb-1">{review.title}</p>}
              <p className="text-sm text-muted-foreground leading-relaxed">{review.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}