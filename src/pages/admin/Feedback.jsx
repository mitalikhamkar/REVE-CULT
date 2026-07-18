import React, { useState, useEffect } from "react";
import { Check, Star, MessageSquare, Mail, Inbox } from "lucide-react";
import { entities } from "@/api/entities";

const TICKET_BADGE = {
  open: "bg-destructive/10 text-destructive",
  in_progress: "bg-gold/15 text-gold",
  resolved: "bg-sage/15 text-sage",
};

export default function AdminFeedback() {
  const [tickets, setTickets] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [tab, setTab] = useState("tickets");

  useEffect(() => {
    Promise.all([
      entities.SupportTicket.list("-created_date").catch(() => []),
      entities.Review.list("-created_date").catch(() => []),
      entities.NewsletterSubscriber.list().catch(() => []),
    ]).then(([t, r, s]) => {
      setTickets(t);
      setReviews(r);
      setSubscribers(s);
      setLoading(false);
    });
  }, []);

  const resolveTicket = async (id) => {
    setUpdatingId(id);
    try {
      await entities.SupportTicket.update(id, { status: "resolved" });
      setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status: "resolved" } : t)));
    } catch {
      /* prototype */
    } finally {
      setUpdatingId(null);
    }
  };

  const openTickets = tickets.filter((t) => t.status !== "resolved");
  const resolvedTickets = tickets.filter((t) => t.status === "resolved");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-blush/30 border-t-blush rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-light mb-1">Feedback & Support</h1>
        <p className="text-sm text-muted-foreground">Customer messages, reviews, and newsletter subscribers</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-4 bg-white rounded-xl border border-border text-center">
          <p className="text-xs text-muted-foreground mb-1">Open Tickets</p>
          <p className="text-lg font-heading font-semibold text-destructive">{openTickets.length}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-border text-center">
          <p className="text-xs text-muted-foreground mb-1">Total Reviews</p>
          <p className="text-lg font-heading font-semibold">{reviews.length}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-border text-center">
          <p className="text-xs text-muted-foreground mb-1">Newsletter Subscribers</p>
          <p className="text-lg font-heading font-semibold text-sage">{subscribers.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-border p-1 mb-5 w-fit">
        <TabButton active={tab === "tickets"} onClick={() => setTab("tickets")} icon={Inbox} label={`Support Tickets (${tickets.length})`} />
        <TabButton active={tab === "reviews"} onClick={() => setTab("reviews")} icon={Star} label={`Reviews (${reviews.length})`} />
        <TabButton active={tab === "subscribers"} onClick={() => setTab("subscribers")} icon={Mail} label={`Subscribers (${subscribers.length})`} />
      </div>

      {/* Support tickets */}
      {tab === "tickets" && (
        <div className="space-y-3">
          {tickets.length === 0 ? (
            <EmptyState icon={MessageSquare} text="No support tickets yet." />
          ) : (
            <>
              {openTickets.length > 0 && (
                <>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Open — Needs Attention</p>
                  {openTickets.map((t) => (
                    <TicketCard key={t.id} ticket={t} onResolve={resolveTicket} updating={updatingId === t.id} />
                  ))}
                </>
              )}
              {resolvedTickets.length > 0 && (
                <>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium pt-3">Resolved</p>
                  {resolvedTickets.map((t) => (
                    <TicketCard key={t.id} ticket={t} onResolve={resolveTicket} updating={updatingId === t.id} />
                  ))}
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* Reviews */}
      {tab === "reviews" && (
        <div className="space-y-3">
          {reviews.length === 0 ? (
            <EmptyState icon={Star} text="No reviews yet." />
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="p-5 bg-white rounded-2xl border border-border">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="text-sm font-medium">{r.product_name || "Product"}</p>
                    <p className="text-xs text-muted-foreground">by {r.reviewer_name || "Anonymous"} · {new Date(r.created_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                  <div className="flex shrink-0">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={13} className={i < (r.rating || 0) ? "fill-gold text-gold" : "text-border"} />
                    ))}
                  </div>
                </div>
                {r.title && <p className="text-sm font-medium mb-0.5">{r.title}</p>}
                <p className="text-sm text-muted-foreground">{r.content}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Newsletter subscribers */}
      {tab === "subscribers" && (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          {subscribers.length === 0 ? (
            <EmptyState icon={Mail} text="No subscribers yet." />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-accent/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Subscribed On</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-accent/20 transition-colors">
                    <td className="px-5 py-3.5 font-medium">{s.email}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {new Date(s.created_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

function TicketCard({ ticket, onResolve, updating }) {
  return (
    <div className="p-5 bg-white rounded-2xl border border-border">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <p className="text-sm font-medium">{ticket.subject}</p>
          <p className="text-xs text-muted-foreground">
            {ticket.name} · {ticket.email}
          </p>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize shrink-0 ${TICKET_BADGE[ticket.status] || "bg-accent text-muted-foreground"}`}>
          {ticket.status?.replace("_", " ")}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-3">{ticket.message}</p>
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-muted-foreground">
          {new Date(ticket.created_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </p>
        {ticket.status !== "resolved" && (
          <button
            onClick={() => onResolve(ticket.id)}
            disabled={updating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sage/10 text-sage rounded-full text-xs font-medium hover:bg-sage/20 transition-colors disabled:opacity-50"
          >
            {updating ? "Updating..." : <><Check size={13} /> Mark Resolved</>}
          </button>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active ? "bg-blush text-white" : "text-muted-foreground hover:bg-accent"
      }`}
    >
      <Icon size={15} />
      {label}
    </button>
  );
}

function EmptyState({ icon: Icon, text }) {
  return (
    <div className="p-12 bg-white rounded-2xl border border-border text-center">
      <Icon size={32} className="mx-auto text-muted-foreground mb-3" strokeWidth={1} />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}