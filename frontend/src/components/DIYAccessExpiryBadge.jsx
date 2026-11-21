import { useEffect, useState } from "react";
import { ShieldCheck, Clock, AlertTriangle } from "lucide-react";
import { checkDIYAdminAccess } from "../api/diyAdminApi";

function DIYAccessExpiryBadge() {
  const [accessInfo, setAccessInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    let mounted = true;

    const loadAccessInfo = async () => {
      try {
        const response = await checkDIYAdminAccess();
        const data = response?.data || response;

        if (mounted && data?.has_access) {
          setAccessInfo(data);
        }
      } catch (error) {
        // A user without DIY Admin access should not see this indicator.
        if (mounted) {
          setAccessInfo(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadAccessInfo();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  if (loading || !accessInfo || accessInfo.is_superuser) {
    return null;
  }

  const isPermanent =
    accessInfo.access_type === "permanent" ||
    !accessInfo.expires_at;

  let remainingText = "Permanent Access";
  let badgeColor = "#166534";
  let badgeBackground = "#dcfce7";
  let Icon = ShieldCheck;

  if (!isPermanent) {
    const expiryTime = new Date(accessInfo.expires_at).getTime();
    const remainingMilliseconds = expiryTime - currentTime;

    if (remainingMilliseconds <= 0) {
      remainingText = "Access Expired";
      badgeColor = "#991b1b";
      badgeBackground = "#fee2e2";
      Icon = AlertTriangle;
    } else {
      const remainingDays = Math.ceil(
        remainingMilliseconds / (1000 * 60 * 60 * 24)
      );

      if (remainingDays === 1) {
        remainingText = "Expires tomorrow";
      } else {
        remainingText = `${remainingDays} days remaining`;
      }

      if (remainingDays <= 7) {
        badgeColor = "#92400e";
        badgeBackground = "#fef3c7";
        Icon = AlertTriangle;
      } else {
        badgeColor = "#166534";
        badgeBackground = "#dcfce7";
        Icon = Clock;
      }
    }
  }

  return (
    <div
      title={`DIY Admin Access: ${remainingText}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "7px",
        padding: "7px 10px",
        borderRadius: "999px",
        background: badgeBackground,
        color: badgeColor,
        border: `1px solid ${badgeColor}20`,
        fontSize: "12px",
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      <Icon size={15} />

      <span>
        DIY Admin · {remainingText}
      </span>
    </div>
  );
}

export default DIYAccessExpiryBadge;