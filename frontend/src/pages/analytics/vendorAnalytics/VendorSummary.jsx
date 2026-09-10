import {
  Building2,
  Mail,
  PlayCircle,
  CheckCircle2,
} from "lucide-react";

import "./VendorSummary.css";

export default function VendorSummary({ vendor, ir }) {
  if (!vendor) return null;

  return (
    <div className="vendor-summary">

      {/* Left Side */}
      <div className="vendor-info">
        <h2>{vendor.name}</h2>

        <div className="vendor-meta">
          <div className="meta-item">
            <Building2 size={18} />
            <span>Vendor</span>
          </div>

          {vendor.email && (
            <div className="meta-item">
              <Mail size={18} />
              <span>{vendor.email}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Side */}
      <div className="vendor-status">
        <div
          className={`status-badge ${
            vendor.status === "Active" ? "running" : "on_hold"
          }`}
        >
          <PlayCircle size={16} />
          {vendor.status}
        </div>

        <div className="completion-box">
          <CheckCircle2 size={18} />
          <div>
            <small>Completion Rate</small>
            <h3>{ir}%</h3>
          </div>
        </div>
      </div>

    </div>
  );
}
