export default function VendorFilter({
  vendors,
  selectedVendor,
  onChange,
}) {
  return (
    <div className="project-filter-card">
      <div>
        <label>Select Vendor</label>
        <select
          value={selectedVendor}
          onChange={(e) => onChange(e.target.value)}
        >
          {vendors.map((vendor) => (
            <option key={vendor.id} value={vendor.id}>
              {vendor.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
