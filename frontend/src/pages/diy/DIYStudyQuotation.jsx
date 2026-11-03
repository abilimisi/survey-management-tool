
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../../api/axiosInstance";
import { createDIYQuotation } from "../../api/diyReviewApi";
import "./DIYStudyQuotation.css";

function formatLabel(value) {
  if (!value) return "—";

  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function DIYStudyQuotation() {
  const { studyId } = useParams();
  const navigate = useNavigate();

  const [study, setStudy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    quoted_amount: "",
    currency: "INR",
    proposed_completes: "",
    estimated_timeline_days: "",
    notes: "",
  });

  useEffect(() => {
    let active = true;

    async function loadStudy() {
      try {
        setLoading(true);

        const response = await axiosInstance.get(
          "/diy/internal/studies/"
        );

        const studies = Array.isArray(response.data)
          ? response.data
          : [];

        const selectedStudy = studies.find(
          (item) => String(item.id) === String(studyId)
        );

        if (!selectedStudy) {
          throw new Error("Study not found.");
        }

        if (active) {
          setStudy(selectedStudy);

          setForm((previous) => ({
            ...previous,
            proposed_completes:
              selectedStudy.proposed_completes ??
              selectedStudy.target_completes ??
              "",
            estimated_timeline_days:
              selectedStudy.estimated_timeline_days ?? "",
          }));
        }
      } catch (error) {
        if (active) {
          toast.error(
            error.message === "Study not found."
              ? error.message
              : error.response?.data?.detail ||
                  "Unable to load study details."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadStudy();

    return () => {
      active = false;
    };
  }, [studyId]);

  const updateForm = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!study) return;

    if (Number(form.quoted_amount) <= 0) {
      toast.error("Enter a valid quotation amount.");
      return;
    }

    if (
      !form.proposed_completes ||
      Number(form.proposed_completes) <= 0
    ) {
      toast.error("Enter valid proposed completes.");
      return;
    }

    if (
      !form.estimated_timeline_days ||
      Number(form.estimated_timeline_days) <= 0
    ) {
      toast.error("Enter a valid estimated timeline.");
      return;
    }

    const payload = {
      quoted_amount: Number(form.quoted_amount),
      currency: form.currency,
      proposed_completes: Number(form.proposed_completes),
      estimated_timeline_days: Number(
        form.estimated_timeline_days
      ),
      notes: form.notes.trim(),
    };

    setSaving(true);

    try {
      const response = await createDIYQuotation(
        studyId,
        payload
      );

      toast.success(
        response.data.message ||
          "Quotation draft created successfully."
      );

      navigate(`/diy/studies/${studyId}`);
    } catch (error) {
      const data = error.response?.data;

      const message =
        data?.error ||
        data?.detail ||
        (data && typeof data === "object"
          ? Object.values(data).flat().join(" ")
          : "Unable to create quotation draft.");

      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <main className="diy-quotation-page">Loading study...</main>;
  }

  if (!study) {
    return (
      <main className="diy-quotation-page">
        <p>Study not found or unavailable.</p>
        <Link to="/diy/studies">Back to studies</Link>
      </main>
    );
  }

  const assessmentEligible = [
    "feasible",
    "feasible_with_conditions",
  ].includes(study.assessment_status);

  return (
    <main className="diy-quotation-page">
      <header className="diy-quotation-header">
        <div>
          <p>ADMIN WORKSPACE</p>
          <h1>Create Quotation</h1>
          <span>
            {study.name || "Untitled Study"} · Study #{study.id}
          </span>
        </div>

        <Link
          className="diy-quotation-back"
          to={`/diy/studies/${studyId}`}
        >
          Back to Study
        </Link>
      </header>

      {!assessmentEligible ? (
        <section className="diy-quotation-warning">
          <h2>Quotation unavailable</h2>
          <p>
            A quotation can only be created after a study has
            been assessed as Feasible or Feasible with Conditions.
          </p>
        </section>
      ) : (
        <>
          <section className="diy-quotation-assessment">
            <h2>Assessment Summary</h2>

            <div className="diy-quotation-summary-grid">
              <div>
                <span>Feasibility</span>
                <strong>
                  {formatLabel(study.assessment_status)}
                </strong>
              </div>

              <div>
                <span>Estimated Budget</span>
                <strong>
                  {study.estimated_budget != null
                    ? `INR ${Number(
                        study.estimated_budget
                      ).toLocaleString("en-IN")}`
                    : "Not specified"}
                </strong>
              </div>

              <div>
                <span>Proposed Completes</span>
                <strong>
                  {study.proposed_completes ?? "—"}
                </strong>
              </div>

              <div>
                <span>Estimated Timeline</span>
                <strong>
                  {study.estimated_timeline_days != null
                    ? `${study.estimated_timeline_days} days`
                    : "—"}
                </strong>
              </div>
            </div>
          </section>

          <form
            className="diy-quotation-form"
            onSubmit={handleSubmit}
          >
            <div className="diy-quotation-form-heading">
              <h2>Quotation Details</h2>
              <p>
                Enter the final commercial quotation for the client.
                This amount is separate from the estimated budget.
              </p>
            </div>

            <div className="diy-quotation-grid">
              <div className="diy-quotation-field">
                <label htmlFor="quoted_amount">
                  Final Quotation Amount *
                </label>

                <input
                  id="quoted_amount"
                  name="quoted_amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.quoted_amount}
                  onChange={updateForm}
                  placeholder="Enter final quotation amount"
                  required
                />
              </div>

              <div className="diy-quotation-field">
                <label htmlFor="currency">Currency *</label>

                <select
                  id="currency"
                  name="currency"
                  value={form.currency}
                  onChange={updateForm}
                  required
                >
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>
              </div>

              <div className="diy-quotation-field">
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
                  required
                />
              </div>

              <div className="diy-quotation-field">
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
                  required
                />
              </div>
            </div>

            <div className="diy-quotation-field">
              <label htmlFor="notes">Quotation Notes</label>

              <textarea
                id="notes"
                name="notes"
                rows={5}
                value={form.notes}
                onChange={updateForm}
                placeholder="Add pricing details, conditions, exclusions, or other information for the client..."
              />
            </div>

            <div className="diy-quotation-actions">
              <Link
                className="diy-quotation-cancel"
                to={`/diy/studies/${studyId}`}
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Quotation Draft"}
              </button>
            </div>
          </form>
        </>
      )}
    </main>
  );
}
