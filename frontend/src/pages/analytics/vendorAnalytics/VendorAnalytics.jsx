import { useEffect, useState } from "react";

import {
  getVendorList,
  getAnalyticsVendorDetails,
} from "../../../api/analyticsApi";

import VendorFilter from "./VendorFilter";
import VendorSummary from "./VendorSummary";
import VendorSummaryCards from "./VendorSummaryCards";

import ChartCard from "../ChartCard";
import StatusChart from "../StatusChart";
import HitsChart from "../HitsChart";
import SplitBarChart from "../SplitBarChart";

import "./VendorAnalytics.css";

export default function VendorAnalytics() {

  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [vendorData, setVendorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    loadVendors();
  }, []);

  useEffect(() => {
    if (selectedVendor) {
      loadVendor(selectedVendor);
    }
  }, [selectedVendor]);

  const loadVendors = async () => {
    try {
      const data = await getVendorList();
      setVendors(data);
      if (data.length > 0) {
        setSelectedVendor(data[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadVendor = async (id) => {
    setDetailLoading(true);
    try {
      const data = await getAnalyticsVendorDetails(id);
      setVendorData(data);
    } finally {
      setDetailLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  // project_split from backend -> [{ project_id, project_name, hits }]
  // SplitBarChart expects [{ name, value }]
  const projectSplitData = (vendorData?.project_split || []).map((p) => ({
    name: p.project_name,
    value: p.hits,
  }));

  return (
    <div className="vendor-analytics">
      <div className="analytics-page-header">
        <h2>Vendor Analytics</h2>
        <p>Monitor individual vendor performance and delivery quality.</p>
      </div>

      <VendorFilter
        vendors={vendors}
        selectedVendor={selectedVendor}
        onChange={setSelectedVendor}
      />

      {vendorData && !detailLoading && (
        <>
          <VendorSummary
            vendor={vendorData.vendor}
            ir={vendorData.summary.ir}
          />

          <VendorSummaryCards summary={vendorData.summary} />

          {/* CHARTS — status donut + 7-day trend */}
          <div className="vendor-analytics-chart-grid">
            <ChartCard
              title="Status Distribution"
              subtitle="Respondent outcomes for this vendor"
            >
              <StatusChart
                data={vendorData.status_breakdown}
                centerValue={vendorData.summary.hits}
                centerLabel="Total Hits"
                height={280}
              />
            </ChartCard>

            <ChartCard
              title="Hits Trend"
              subtitle="Last 7 days"
              right={<span>{vendorData.summary.hits} total</span>}
            >
              <HitsChart data={vendorData.trend} color="#8b5cf6" height={280} />
            </ChartCard>
          </div>

          {/* Project split for this vendor */}
          <ChartCard
            title="Project Split"
            subtitle="Which projects this vendor is delivering on"
          >
            <SplitBarChart data={projectSplitData} />
          </ChartCard>
        </>
      )}

      {detailLoading && <div className="analytics-empty">Loading vendor data...</div>}
    </div>
  );
}
