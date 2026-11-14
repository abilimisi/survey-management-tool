
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sendSessionHeartbeat } from "../api/authApi";

const HEARTBEAT_INTERVAL = 5 * 60 * 1000;
const RECENT_ACTIVITY_WINDOW = 10 * 60 * 1000;

function SessionHeartbeat() {
  const navigate = useNavigate();

  useEffect(() => {
    let lastActivityAt = Date.now();
    let lastHeartbeatAt = Date.now();
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

      const now = Date.now();

      // Only send a heartbeat if there was recent user activity.
      if (now - lastActivityAt > RECENT_ACTIVITY_WINDOW) return;

      // Do not send heartbeats more frequently than the configured interval.
      if (now - lastHeartbeatAt < HEARTBEAT_INTERVAL) return;

      // const accessToken = localStorage.getItem("access_token");

      if (!accessToken) {
        clearAuth();
        navigate("/login", { replace: true });
        return;
      }

      heartbeatInProgress = true;

      try {
        await sendSessionHeartbeat();

        // Update only after the backend confirms the heartbeat.
        lastHeartbeatAt = Date.now();
      } catch (error) {
        if (error.response?.status === 401) {
          clearAuth();
          navigate("/login", { replace: true });
        }

        // Do not log the user out for temporary network/server errors.
      } finally {
        heartbeatInProgress = false;
      }
    };

    const recordActivity = () => {
      lastActivityAt = Date.now();

      // If the user returns after being idle, check the session promptly
      // instead of waiting for the next five-minute timer.
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
        // Visibility alone is not treated as user activity.
        sendHeartbeat();
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

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
