
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sendSessionHeartbeat } from "../api/authApi";

const HEARTBEAT_INTERVAL = 30 * 1000; // 30 seconds
const RECENT_ACTIVITY_WINDOW = 60 * 1000; // 1 minute

function SessionHeartbeat() {
  const navigate = useNavigate();

  useEffect(() => {
    let lastActivityAt = Date.now();
    let lastHeartbeatAt = 0;
    let heartbeatInProgress = false;
    let isUnmounted = false;

    const clearAuth = () => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("username");
      localStorage.removeItem("is_superuser");
      localStorage.removeItem("role");
    };

    const sendHeartbeat = async () => {
      if (isUnmounted || heartbeatInProgress) return;

      if (document.visibilityState !== "visible") return;

      const accessToken = localStorage.getItem("access_token");

      if (!accessToken) {
        clearAuth();
        navigate("/login", { replace: true });
        return;
      }

      const now = Date.now();

      // Only maintain the session while the user has been recently active.
      if (now - lastActivityAt > RECENT_ACTIVITY_WINDOW) return;

      // Avoid sending heartbeats too frequently.
      if (now - lastHeartbeatAt < HEARTBEAT_INTERVAL) return;

      heartbeatInProgress = true;

      try {
        await sendSessionHeartbeat();

        if (!isUnmounted) {
          lastHeartbeatAt = Date.now();
        }
      } catch (error) {
        if (error.response?.status === 401) {
          clearAuth();
          navigate("/login", { replace: true });
        }
      } finally {
        heartbeatInProgress = false;
      }
    };

    const recordActivity = () => {
      lastActivityAt = Date.now();
      sendHeartbeat();
    };

    const activityEvents = [
      "pointerdown",
      "keydown",
      "scroll",
      "touchstart",
      "mousemove",
    ];

    activityEvents.forEach((event) => {
      window.addEventListener(event, recordActivity, { passive: true });
    });

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Returning to the tab does not itself count as user activity.
        sendHeartbeat();
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    // Start the first heartbeat after the component mounts.
    sendHeartbeat();

    const heartbeatTimer = setInterval(() => {
      sendHeartbeat();
    }, HEARTBEAT_INTERVAL);

    return () => {
      isUnmounted = true;
      clearInterval(heartbeatTimer);

      activityEvents.forEach((event) => {
        window.removeEventListener(event, recordActivity);
      });

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [navigate]);

  return null;
}

export default SessionHeartbeat;
