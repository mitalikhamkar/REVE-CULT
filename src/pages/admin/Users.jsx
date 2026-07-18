import React, { useState, useEffect } from "react";
import { Shield, ShieldCheck, Search, ShieldOff, Loader2, UserCog } from "lucide-react";
import { entities } from "@/api/entities";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "@/components/ui/use-toast";

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState(null);

  const load = () => {
    setLoading(true);
    entities.User.list()
      .catch(() => [])
      .then((data) => {
        setUsers(data);
        setLoading(false);
      });
  };

  useEffect(() => { load(); }, []);

  const toggleRole = async (u) => {
    const newRole = u.role === "admin" ? "user" : "admin";
    setUpdating(u.id);
    try {
      await entities.User.update(u.id, { role: newRole });
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role: newRole } : x)));
      toast({
        title: newRole === "admin" ? "Admin access granted" : "Admin access revoked",
        description: `${u.email} is now ${newRole === "admin" ? "an admin" : "a regular user"}.`,
      });
    } catch {
      toast({
        title: "Update failed",
        description: "Could not update this user's role.",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.email?.toLowerCase().includes(q) || u.full_name?.toLowerCase().includes(q);
  });

  const adminCount = users.filter((u) => u.role === "admin").length;

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
        <h1 className="text-2xl font-heading font-light mb-1">User Roles & Access</h1>
        <p className="text-sm text-muted-foreground">
          Grant or revoke admin access for registered accounts.{" "}
          <span className="font-medium text-foreground">{adminCount}</span> admin{adminCount !== 1 ? "s" : ""} currently.
        </p>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blush/40"
        />
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-accent/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3 font-medium">Account</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => {
              const isAdmin = u.role === "admin";
              const isSelf = u.id === currentUser?.id;
              return (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-accent/20 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blush/15 flex items-center justify-center text-sm font-medium text-blush shrink-0">
                        {(u.full_name || u.email || "?")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {u.full_name || "No name set"}
                          {isSelf && <span className="ml-2 text-[10px] uppercase tracking-wider text-muted-foreground">You</span>}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      isAdmin ? "bg-blush/15 text-blush" : "bg-accent text-muted-foreground"
                    }`}>
                      {isAdmin ? <ShieldCheck size={12} /> : <Shield size={12} />}
                      {isAdmin ? "Admin" : "User"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => toggleRole(u)}
                      disabled={updating === u.id || isSelf}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={isSelf ? "You cannot change your own role" : undefined}
                    >
                      {updating === u.id ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : isAdmin ? (
                        <>
                          <ShieldOff size={13} /> Revoke Admin
                        </>
                      ) : (
                        <>
                          <UserCog size={13} /> Grant Admin
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-sm text-muted-foreground">No users found.</div>
        )}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Note: Only registered accounts appear here. New users are added automatically when they sign up.
      </p>
    </div>
  );
}