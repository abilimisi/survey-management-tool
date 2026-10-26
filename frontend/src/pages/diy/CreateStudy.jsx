import { useNavigate } from "react-router-dom";
import { useState } from "react";

const initialForm = {
  studyName: "",
  studyType: "Online Survey",
  country: "",
  language: "English",
  surveyLink: "",
  targetCompletes: "",
  surveyLength: "",
  incidenceRate: "",
  description: "",
};

function CreateStudy() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const newErrors = {};

    if (!form.studyName.trim()) {
      newErrors.studyName = "Please enter a study name.";
    }

    if (!form.country) {
      newErrors.country = "Please select a country.";
    }

    if (
      !form.targetCompletes ||
      Number(form.targetCompletes) <= 0 ||
      !Number.isInteger(Number(form.targetCompletes))
    ) {
      newErrors.targetCompletes =
        "Enter a positive whole number of completes.";
    }

    if (
      !form.surveyLength ||
      Number(form.surveyLength) <= 0
    ) {
      newErrors.surveyLength =
        "Enter the expected survey length in minutes.";
    }

    if (
      form.incidenceRate !== "" &&
      (Number(form.incidenceRate) < 1 ||
        Number(form.incidenceRate) > 100)
    ) {
      newErrors.incidenceRate =
        "Incidence rate must be between 1 and 100.";
    }

    if (form.surveyLink.trim()) {
      try {
        const url = new URL(form.surveyLink);
        if (!["http:", "https:"].includes(url.protocol)) {
          newErrors.surveyLink = "Use a valid HTTP or HTTPS URL.";
        }
      } catch {
        newErrors.surveyLink = "Enter a valid survey URL.";
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // Temporary: this only displays the entered details.
    // Saving to Django/MySQL will be added in the next stage.
    alert(
      "Form validated successfully!\n\n" +
        "Study: " + form.studyName +
        "\nCountry: " + form.country +
        "\nTarget: " + form.targetCompletes +
        "\n\nThe study has NOT been saved yet."
    );
  };

  const fieldStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    fontSize: "14px",
    marginTop: "7px",
  };

  const renderError = (name) =>
    errors[name] ? (
      <p style={{ color: "#dc2626", fontSize: "12px" }}>
        {errors[name]}
      </p>
    ) : null;

  const labelStyle = {
    display: "block",
    fontSize: "14px",
    fontWeight: 600,
    color: "#374151",
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "28px" }}>
      <button
        type="button"
        onClick={() => navigate("/diy")}
        style={{
          border: "none",
          background: "transparent",
          color: "#2563eb",
          cursor: "pointer",
          padding: 0,
          marginBottom: "18px",
        }}
      >
        ← Back to Dashboard
      </button>

      <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>
        Create a New Study
      </h1>

      <p style={{ color: "#6b7280", marginBottom: "28px" }}>
        Tell us about your research so we can plan your sample requirements.
      </p>

      <form onSubmit={handleSubmit}>
        <section style={sectionStyle}>
          <h2 style={sectionHeadingStyle}>Study Basics</h2>

          <div style={gridStyle}>
            <div>
              <label style={labelStyle}>
                Study Name *
                <input
                  style={fieldStyle}
                  name="studyName"
                  value={form.studyName}
                  onChange={handleChange}
                  placeholder="e.g. Consumer Brand Awareness"
                />
              </label>
              {renderError("studyName")}
            </div>

            <div>
              <label style={labelStyle}>
                Study Type *
                <select
                  style={fieldStyle}
                  name="studyType"
                  value={form.studyType}
                  onChange={handleChange}
                >
                  <option>Online Survey</option>
                  <option>Customer Satisfaction</option>
                  <option>Brand Awareness</option>
                  <option>Product Research</option>
                  <option>Other</option>
                </select>
              </label>
            </div>

            <div>
              <label style={labelStyle}>
                Country *
                <select
                  style={fieldStyle}
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                >
                  <option value="">Select country</option>
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              {renderError("country")}
            </div>

            <div>
              <label style={labelStyle}>
                Survey Language *
                <select
                  style={fieldStyle}
                  name="language"
                  value={form.language}
                  onChange={handleChange}
                >
                  <option>English</option>
                  <option>Hindi</option>
                  <option>French</option>
                  <option>Spanish</option>
                  <option>Other</option>
                </select>
              </label>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>
                Survey Link (optional)
                <input
                  style={fieldStyle}
                  type="url"
                  name="surveyLink"
                  value={form.surveyLink}
                  onChange={handleChange}
                  placeholder="https://example.com/survey"
                />
              </label>
              {renderError("surveyLink")}
            </div>
          </div>
        </section>

        <section style={sectionStyle}>
          <h2 style={sectionHeadingStyle}>Sample Requirements</h2>

          <div style={gridStyle}>
            <div>
              <label style={labelStyle}>
                Target Completes *
                <input
                  style={fieldStyle}
                  type="number"
                  min="1"
                  step="1"
                  name="targetCompletes"
                  value={form.targetCompletes}
                  onChange={handleChange}
                  placeholder="e.g. 500"
                />
              </label>
              {renderError("targetCompletes")}
            </div>

            <div>
              <label style={labelStyle}>
                Survey Length (minutes) *
                <input
                  style={fieldStyle}
                  type="number"
                  min="1"
                  step="1"
                  name="surveyLength"
                  value={form.surveyLength}
                  onChange={handleChange}
                  placeholder="e.g. 10"
                />
              </label>
              {renderError("surveyLength")}
            </div>

            <div>
              <label style={labelStyle}>
                Expected Incidence Rate (%)
                <input
                  style={fieldStyle}
                  type="number"
                  min="1"
                  max="100"
                  name="incidenceRate"
                  value={form.incidenceRate}
                  onChange={handleChange}
                  placeholder="e.g. 40"
                />
              </label>
              {renderError("incidenceRate")}
            </div>
          </div>
        </section>

        <section style={sectionStyle}>
          <h2 style={sectionHeadingStyle}>Additional Information</h2>

          <label style={labelStyle}>
            Study Description
            <textarea
              style={{ ...fieldStyle, minHeight: "110px", resize: "vertical" }}
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your research objectives and audience..."
            />
          </label>
        </section>

        <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
          <button type="submit" style={primaryButtonStyle}>
            Validate Study Details
          </button>

          <button
            type="button"
            onClick={() => navigate("/diy")}
            style={secondaryButtonStyle}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

const sectionStyle = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  padding: "24px",
  marginBottom: "20px",
};

const sectionHeadingStyle = {
  fontSize: "18px",
  margin: "0 0 22px",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "22px",
};

const primaryButtonStyle = {
  background: "#2563eb",
  color: "#ffffff",
  border: "none",
  borderRadius: "8px",
  padding: "12px 18px",
  cursor: "pointer",
  fontWeight: 600,
};

const secondaryButtonStyle = {
  background: "#ffffff",
  color: "#374151",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  padding: "12px 18px",
  cursor: "pointer",
};

export default CreateStudy;