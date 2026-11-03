
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { assessDIYStudy } from "../../api/diyReviewApi";
import "./DIYStudyAssessment.css";

export default function DIYStudyAssessment() {
  const { studyId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    assessment_status: "feasible",
    proposed_completes: "",
    estimated_timeline_days: "",
    estimated_budget: "",
    assessment_notes: "",
  });

  const [saving, setSaving] = useState(false);

  const updateForm = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      form.assessment_status !== "not_feasible" &&
      (!form.proposed_completes ||
        Number(form.proposed_completes) <= 0 ||
        !form.estimated_timeline_days ||
        Number(form.estimated_timeline_days) <= 0)
    ) {
      toast.error("Enter valid proposed completes and timeline.");
      return;
    }

    if (
      form.estimated_budget !== "" &&
      Number(form.estimated_budget) < 0
    ) {
      toast.error("Estimated budget cannot be negative.");
      return;
    }

    if (
      form.assessment_status === "not_feasible" &&
      !form.assessment_notes.trim()
    ) {
      toast.error("Please explain why this study is not feasible.");
      return;
    }

    const payload = {
      ...form,
      proposed_completes:
        form.proposed_completes === ""
          ? null
          : Number(form.proposed_completes),
      estimated_timeline_days:
        form.estimated_timeline_days === ""
          ? null
          : Number(form.estimated_timeline_days),
      estimated_budget:
        form.estimated_budget === ""
          ? null
          : Number(form.estimated_budget),
      assessment_notes: form.assessment_notes.trim(),
    };

    setSaving(true);

    try {
      const response = await assessDIYStudy(studyId, payload);

      toast.success(
        response.data.message || "Assessment saved successfully."
      );

      navigate(`/diy/studies/${studyId}`);
    } catch (error) {
      const data = error.response?.data;

      if (data && typeof data === "object") {
        const message =
          data.error ||
          data.detail ||
          Object.values(data).flat().join(" ");

        toast.error(message || "Unable to save assessment.");
      } else {
        toast.error("Unable to save assessment.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="diy-assessment-page">
      <header className="diy-assessment-header">
        <div>
          <p>ADMIN WORKSPACE</p>
          <h1>Manual Feasibility Assessment</h1>
          <span>Study #{studyId}</span>
        </div>

        <button
          type="button"
          className="diy-assessment-back"
          onClick={() => navigate(`/diy/studies/${studyId}`)}
        >
          Back to Study
        </button>
      </header>

      <form
        className="diy-assessment-form"
        onSubmit={handleSubmit}
      >
        <div className="diy-assessment-intro">
          <h2>Assessment Details</h2>
          <p>
            Review the study requirements and record your manual
            feasibility assessment.
          </p>
        </div>

        <div className="diy-assessment-field">
          <label htmlFor="assessment_status">
            Feasibility Status *
          </label>

          <select
            id="assessment_status"
            name="assessment_status"
            value={form.assessment_status}
            onChange={updateForm}
            required
          >
            <option value="feasible">Feasible</option>
            <option value="feasible_with_conditions">
              Feasible with Conditions
            </option>
            <option value="not_feasible">Not Feasible</option>
          </select>
        </div>

        {form.assessment_status !== "not_feasible" && (
          <div className="diy-assessment-grid">
            <div className="diy-assessment-field">
              <label htmlFor="proposed_completes">
                Proposed Completes *
              </label>

              <input
                id="proposed_completes"
                name="proposed_completes"
                type="number"
                min="1"
                value={form.proposed_completes}
                onChange={updateForm}
                placeholder="Enter proposed completes"
                required
              />
            </div>

            <div className="diy-assessment-field">
              <label htmlFor="estimated_timeline_days">
                Estimated Timeline (Days) *
              </label>

              <input
                id="estimated_timeline_days"
                name="estimated_timeline_days"
                type="number"
                min="1"
                value={form.estimated_timeline_days}
                onChange={updateForm}
                placeholder="Enter timeline"
                required
              />
            </div>
          </div>
        )}

        <div className="diy-assessment-field">
          <label htmlFor="estimated_budget">
            Estimated Budget (INR)
          </label>

          <input
            id="estimated_budget"
            name="estimated_budget"
            type="number"
            min="0"
            step="0.01"
            value={form.estimated_budget}
            onChange={updateForm}
            placeholder="Enter estimated budget"
          />
        </div>

        <div className="diy-assessment-field">
          <label htmlFor="assessment_notes">
            Assessment Notes
            {form.assessment_status === "not_feasible" && " *"}
          </label>

          <textarea
            id="assessment_notes"
            name="assessment_notes"
            rows={5}
            value={form.assessment_notes}
            onChange={updateForm}
            placeholder="Add feasibility observations, conditions, limitations, or recommendations..."
            required={form.assessment_status === "not_feasible"}
          />
        </div>

        <div className="diy-assessment-actions">
          <button
            type="button"
            className="diy-assessment-cancel"
            onClick={() => navigate(`/diy/studies/${studyId}`)}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="diy-assessment-save"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Assessment"}
          </button>
        </div>
      </form>
    </main>
  );
}
