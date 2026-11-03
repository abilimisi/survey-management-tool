import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sendSessionHeartbeat } from "../api/authApi";

function SessionHeartbeat() {
  const navigate = useNavigate();

  useEffect(() => {
    let lastActivityAt = Date.now();
    let lastHeartbeatActivityAt = 0;
    let heartbeatInProgress = false;

    const recordActivity = () => {
      lastActivityAt = Date.now();
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

    const heartbeatTimer = setInterval(async () => {
      const now = Date.now();

      // Do not send heartbeat while the browser tab is hidden.
      if (document.visibilityState !== "visible") return;

      // Only send heartbeat if there was recent user activity.
      if (now - lastActivityAt > 2 * 60 * 1000) return;

      // Avoid overlapping heartbeat requests.
      if (heartbeatInProgress) return;

      // Avoid sending duplicate heartbeats for the same activity.
      if (lastActivityAt <= lastHeartbeatActivityAt) return;

      const accessToken = localStorage.getItem("access_token");

      if (!accessToken) {
        navigate("/login", { replace: true });
        return;
      }

      heartbeatInProgress = true;

      try {
        await sendSessionHeartbeat(accessToken);
        lastHeartbeatActivityAt = lastActivityAt;
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("is_superuser");
          localStorage.removeItem("role");

          navigate("/login", { replace: true });
        }
      } finally {
        heartbeatInProgress = false;
      }
    }, 2 * 60 * 1000);

    return () => {
      clearInterval(heartbeatTimer);

      activityEvents.forEach((event) => {
        window.removeEventListener(event, recordActivity);
      });
    };
  }, [navigate]);

  return null;
}

export default SessionHeartbeat;