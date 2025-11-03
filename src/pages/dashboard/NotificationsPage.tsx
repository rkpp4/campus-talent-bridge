import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { Bell, Check } from "lucide-react";

export function NotificationsPage() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    fetchNotifications();
  }, [profile?.id]);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", profile?.id || "")
      .order("created_at", { ascending: false });
    setNotifications(data || []);
  };

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    fetchNotifications();
  };

  const markAllAsRead = async () => {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", profile?.id)
      .eq("is_read", false);
    fetchNotifications();
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        {notifications.some((n) => !n.is_read) && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`bg-white p-4 rounded-lg shadow-sm border ${
                !notif.is_read ? "border-blue-200 bg-blue-50" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{notif.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(notif.created_at).toLocaleDateString()}
                  </p>
                </div>
                {!notif.is_read && (
                  <button
                    onClick={() => markAsRead(notif.id)}
                    className="ml-4 p-2 text-blue-600 hover:bg-blue-100 rounded"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
