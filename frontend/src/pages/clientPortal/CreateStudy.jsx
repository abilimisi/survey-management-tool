import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  getClientProfile,
  createClientStudy,
} from "../../api/clientPortalApi";

import "./CreateStudy.css";

const initialForm = {
  company_id: "",
  name: "",
  study_type: "online_survey",
  country: "",
  language: "English",
  survey_link: "",
  target_completes: 200,
  survey_length: 10,
  incidence_rate: 50,
  description: "",

  min_age: "",
  max_age: "",
  gender: "all",
  industry: "",
  profession: "",
  additional_criteria: "",

  quotas: [],
};

const quotaAttributes = [
  { value: "gender", label: "Gender" },
  { value: "age", label: "Age" },
  { value: "country", label: "Country" },
  { value: "region", label: "Region" },
  { value: "industry", label: "Industry" },
  { value: "other", label: "Other" },
];

const steps = [
  {
    number: 1,
    title: "Basic Study Information",
    shortTitle: "Basic Information",
    description: "Enter the essential details of your research project.",
  },
  {
    number: 2,
    title: "Sample Requirements",
    shortTitle: "Sample Requirements",
    description: "Define the audience you want to reach in this study.",
  },
  {
    number: 3,
    title: "Sample Quotas",
    shortTitle: "Sample Quotas",
    description: "Set targets for specific audience categories, if required.",
  },
];

export default function CreateStudy() {
  const navigate = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [activeStep, setActiveStep] = useState(1);

  // Load client companies
  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const response = await getClientProfile();

        if (!active) return;

        const companyList = response.data.companies || [];

        setCompanies(companyList);

        setForm((current) => ({
          ...current,
          company_id: String(companyList[0]?.id || ""),
        }));
      } catch (error) {
        if (!active) return;

        if (error.response?.status === 401) {
          localStorage.removeItem("client_portal_access_token");
          localStorage.removeItem("client_portal_user");

          navigate("/client-portal/login", { replace: true });
        } else {
          toast.error("Unable to load your company information.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [navigate]);

  // Update form fields
  const updateForm = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // Add quota
  const addQuota = () => {
    setForm((current) => ({
      ...current,
      quotas: [
        ...current.quotas,
        {
          attribute: "gender",
          category: "",
          target_completes: "",
        },
      ],
    }));
  };

  // Update quota
  const updateQuota = (index, field, value) => {
    setForm((current) => ({
      ...current,
      quotas: current.quotas.map((quota, quotaIndex) =>
        quotaIndex === index
          ? { ...quota, [field]: value }
          : quota
      ),
    }));
  };

  // Remove quota
  const removeQuota = (index) => {
    setForm((current) => ({
      ...current,
      quotas: current.quotas.filter(
        (_, quotaIndex) => quotaIndex !== index
      ),
    }));
  };

  // Step 1 completion
  const basicInformationComplete = useMemo(() => {
    return Boolean(
      form.company_id &&
      form.name.trim() &&
      form.study_type.trim() &&
      form.country.trim() &&
      form.language.trim() &&
      Number(form.target_completes) >= 1 &&
      Number(form.survey_length) >= 1 &&
      form.incidence_rate !== "" &&
      Number(form.incidence_rate) >= 0 &&
      Number(form.incidence_rate) <= 100
    );
  }, [form]);

  // Step 2 completion
  // These audience criteria are optional in the existing form.
  const sampleRequirementsComplete = true;

  // Step 3 completion
  // Quotas are optional. If a row is added, all its fields must be valid.
  const sampleQuotasComplete = useMemo(() => {
    return form.quotas.every(
      (quota) =>
        quota.category.trim() !== "" &&
        Number(quota.target_completes) >= 1
    );
  }, [form.quotas]);

  const completedSteps = [
    activeStep > 1 && basicInformationComplete,
    activeStep > 2,
    false,
  ];

  const completedCount = completedSteps.filter(Boolean).length;

  // Validate the currently visible step before continuing.
  const validateCurrentStep = () => {
    if (activeStep === 1) {
      if (!form.company_id) {
        toast.error("Please select a company.");
        return false;
      }

      if (!form.name.trim()) {
        toast.error("Please enter a study name.");
        return false;
      }

      if (!form.study_type.trim()) {
        toast.error("Please enter a study type.");
        return false;
      }

      if (!form.country.trim()) {
        toast.error("Please enter the country.");
        return false;
      }

      if (!form.language.trim()) {
        toast.error("Please enter the language.");
        return false;
      }

      if (Number(form.target_completes) < 1) {
        toast.error("Target completes must be at least 1.");
        return false;
      }

      if (Number(form.survey_length) < 1) {
        toast.error("Survey length must be at least 1 minute.");
        return false;
      }

      if (
        form.incidence_rate === "" ||
        Number(form.incidence_rate) < 0 ||
        Number(form.incidence_rate) > 100
      ) {
        toast.error("Incidence rate must be between 0 and 100.");
        return false;
      }
    }


    if (activeStep === 3) {
      const hasIncompleteQuota = form.quotas.some(
        (quota) =>
          !quota.category.trim() ||
          quota.target_completes === "" ||
          Number(quota.target_completes) < 1
      );

      if (hasIncompleteQuota) {
        toast.error(
          "Please complete every quota row or remove the unfinished row."
        );
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;

    setActiveStep((current) => Math.min(current + 1, 3));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevious = () => {
    setActiveStep((current) => Math.max(current - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();

    // Steps 1 and 2 should only move to the next step.
    if (activeStep < 3) {
      if (!validateCurrentStep()) return;

      setActiveStep((current) => Math.min(current + 1, 3));
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Only Step 3 is allowed to create the study.
    handleCreateStudy(event);
  };

  const handleStepClick = (stepNumber) => {
    if (stepNumber <= activeStep) {
      setActiveStep(stepNumber);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCreateStudy = async (event) => {
    event.preventDefault();

    // Prevent form submission from Steps 1 and 2,
    // including accidental Enter-key submissions.
    if (activeStep !== 3) {
      return;
    }

    // Validate all three steps before calling the API.
    if (!basicInformationComplete) {
      setActiveStep(1);
      toast.error("Please complete Basic Study Information.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!validateCurrentStep()) {
      return;
    }

    if (!form.company_id) {
      toast.error("Your account does not have an active company.");
      return;
    }

    setSaving(true);

    const payload = {
      ...form,

      company_id: Number(form.company_id),
      target_completes: Number(form.target_completes),
      survey_length: Number(form.survey_length),
      incidence_rate: Number(form.incidence_rate),

      sample_requirement: {
        min_age:
          form.min_age === "" ? null : Number(form.min_age),
        max_age:
          form.max_age === "" ? null : Number(form.max_age),
        gender: form.gender,
        industry: form.industry,
        profession: form.profession,
        additional_criteria: form.additional_criteria,
      },

      quotas: form.quotas
        .filter(
          (quota) =>
            quota.category.trim() !== "" &&
            quota.target_completes !== ""
        )
        .map((quota) => ({
          attribute: quota.attribute,
          category: quota.category.trim(),
          target_completes: Number(quota.target_completes),
        })),
    };

    delete payload.min_age;
    delete payload.max_age;
    delete payload.gender;
    delete payload.industry;
    delete payload.profession;
    delete payload.additional_criteria;

    try {
      await createClientStudy(payload);

      toast.success("Study created as a draft.");

      navigate("/client-portal/dashboard", {
        state: { studyCreated: true },
      });
    } catch (error) {
      const errors = error.response?.data;

      const message =
        errors?.detail ||
        errors?.error ||
        Object.entries(errors || {})
          .map(
            ([field, messages]) =>
              `${field}: ${
                Array.isArray(messages)
                  ? messages.join(", ")
                  : messages
              }`
          )
          .join(" | ") ||
        "Unable to save the study.";

      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="create-study-loading">
        Loading study form...
      </div>
    );
  }

  const currentStep = steps[activeStep - 1];

  return (
    <div className="create-study-page">
      <div className="create-study-heading">
        <div>
          <h1>Create New Study</h1>
          <p>
            Provide your research requirements to create a new study.
          </p>
        </div>

        <button
          type="button"
          className="create-study-back"
          onClick={() => navigate("/client-portal/dashboard")}
        >
          <span aria-hidden="true">←</span>
          Back to Dashboard
        </button>
      </div>

      {companies.length === 0 ? (
        <div className="create-study-empty">
          <h3>No company available</h3>
          <p>
            Your account does not have an active company.
            Please contact your administrator.
          </p>
        </div>
      ) : (
        <>
          {/* Step progress */}
          <div className="create-study-progress-card">
            <div className="create-study-progress-top">
              <div>
                <span className="create-study-progress-label">
                  STUDY SETUP
                </span>
                <h2>Complete your study details</h2>
              </div>

              <div className="create-study-progress-count">
                <strong>{activeStep}</strong>
                <span> / 3</span>
              </div>
            </div>

            <div
              className="create-study-stepper"
              aria-label={`Step ${activeStep} of 3`}
            >
              {steps.map((step, index) => {
                const isActive = activeStep === step.number;
                const isCompleted = completedSteps[index] && !isActive;
                
                return (
                  <div
                    className={[
                      "create-study-step",
                      isActive ? "is-active" : "",
                      isCompleted ? "is-completed" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    key={step.number}
                  >
                    <button
                      type="button"
                      className="create-study-step-button"
                      onClick={() => handleStepClick(step.number)}
                      disabled={step.number > activeStep}
                      aria-current={isActive ? "step" : undefined}
                      aria-label={`${step.title}${
                        isCompleted ? ", completed" : ""
                      }`}
                    >
                      <span className="create-study-step-number">
                        {isCompleted && step.number < activeStep ? (
                          <span aria-hidden="true">✓</span>
                        ) : (
                          step.number
                        )}
                      </span>

                      <span className="create-study-step-copy">
                        <strong>{step.shortTitle}</strong>
                        <small>
                          {isCompleted
                            ? "Completed"
                            : isActive
                              ? "In progress"
                              : "Not started"}
                        </small>
                      </span>
                    </button>

                    {index < steps.length - 1 && (
                      <span
                        className={[
                          "create-study-step-connector",
                          completedSteps[index]
                            ? "is-completed"
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="create-study-progress-track">
              <span
                style={{
                  width: `${(activeStep / 3) * 100}%`,
                }}
              />
            </div>
          </div>

          <form
            className="create-study-form"
            onSubmit={handleFormSubmit}
            noValidate
          >
            <section className="create-study-section">
              <div className="create-study-section-heading">
                <div className="create-study-section-number">
                  0{activeStep}
                </div>

                <div>
                  <span className="create-study-section-kicker">
                    STEP {activeStep} OF 3
                  </span>
                  <h2>{currentStep.title}</h2>
                  <p className="create-study-section-description">
                    {currentStep.description}
                  </p>
                </div>
              </div>

              {/* STEP 1: BASIC STUDY INFORMATION */}
              {activeStep === 1 && (
                <div className="create-study-step-content">
                  <div className="create-study-field">
                    <label htmlFor="company_id">
                      Company <span className="required-mark">*</span>
                    </label>
                    <select
                      id="company_id"
                      name="company_id"
                      value={form.company_id}
                      onChange={updateForm}
                      required
                    >
                      <option value="">Select a company</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="create-study-field">
                    <label htmlFor="name">
                      Study name <span className="required-mark">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={updateForm}
                      maxLength={255}
                      placeholder="Enter a name for your study"
                      required
                    />
                  </div>

                  <div className="create-study-grid">
                    <div className="create-study-field">
                      <label htmlFor="study_type">
                        Study type <span className="required-mark">*</span>
                      </label>
                      <input
                        id="study_type"
                        name="study_type"
                        value={form.study_type}
                        onChange={updateForm}
                        required
                      />
                      <small>
                        Enter a study type accepted by your backend.
                      </small>
                    </div>

                    <div className="create-study-field">
                      <label htmlFor="country">
                        Country <span className="required-mark">*</span>
                      </label>
                      <input
                        id="country"
                        name="country"
                        value={form.country}
                        onChange={updateForm}
                        placeholder="Enter target country"
                        required
                      />
                    </div>

                    <div className="create-study-field">
                      <label htmlFor="language">
                        Language <span className="required-mark">*</span>
                      </label>
                      <input
                        id="language"
                        name="language"
                        value={form.language}
                        onChange={updateForm}
                        required
                      />
                    </div>

                    <div className="create-study-field">
                      <label htmlFor="survey_link">Survey link</label>
                      <input
                        id="survey_link"
                        name="survey_link"
                        type="url"
                        value={form.survey_link}
                        onChange={updateForm}
                        placeholder="https://example.com/survey"
                      />
                    </div>

                    <div className="create-study-field">
                      <label htmlFor="target_completes">
                        Target completes{" "}
                        <span className="required-mark">*</span>
                      </label>
                      <input
                        id="target_completes"
                        name="target_completes"
                        type="number"
                        min="1"
                        value={form.target_completes}
                        onChange={updateForm}
                        required
                      />
                    </div>

                    <div className="create-study-field">
                      <label htmlFor="survey_length">
                        Survey length (minutes){" "}
                        <span className="required-mark">*</span>
                      </label>
                      <input
                        id="survey_length"
                        name="survey_length"
                        type="number"
                        min="1"
                        value={form.survey_length}
                        onChange={updateForm}
                        required
                      />
                    </div>

                    <div className="create-study-field">
                      <label htmlFor="incidence_rate">
                        Incidence rate (%){" "}
                        <span className="required-mark">*</span>
                      </label>
                      <input
                        id="incidence_rate"
                        name="incidence_rate"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={form.incidence_rate}
                        onChange={updateForm}
                        required
                      />
                    </div>
                  </div>

                  <div className="create-study-field">
                    <label htmlFor="description">
                      Study description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows="4"
                      value={form.description}
                      onChange={updateForm}
                      placeholder="Describe the purpose and objectives of your study..."
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: SAMPLE REQUIREMENTS */}
              {activeStep === 2 && (
                <div className="create-study-step-content">
                  <div className="create-study-info-note">
                    <span aria-hidden="true">ⓘ</span>
                    <p>
                      Specify audience characteristics to help define
                      your target respondents. You can leave these
                      fields unchanged for a broader audience.
                    </p>
                  </div>

                  <div className="create-study-grid">
                    <div className="create-study-field">
                      <label htmlFor="min_age">Minimum age</label>
                      <input
                        id="min_age"
                        name="min_age"
                        type="number"
                        min="0"
                        max="120"
                        value={form.min_age}
                        onChange={updateForm}
                        placeholder="e.g. 25"
                      />
                    </div>

                    <div className="create-study-field">
                      <label htmlFor="max_age">Maximum age</label>
                      <input
                        id="max_age"
                        name="max_age"
                        type="number"
                        min="0"
                        max="120"
                        value={form.max_age}
                        onChange={updateForm}
                        placeholder="e.g. 45"
                      />
                    </div>

                    <div className="create-study-field">
                      <label htmlFor="gender">Gender</label>
                      <select
                        id="gender"
                        name="gender"
                        value={form.gender}
                        onChange={updateForm}
                      >
                        <option value="all">All</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>

                    <div className="create-study-field">
                      <label htmlFor="industry">Industry</label>
                      <input
                        id="industry"
                        name="industry"
                        value={form.industry}
                        onChange={updateForm}
                        placeholder="e.g. Healthcare"
                      />
                    </div>

                    <div className="create-study-field">
                      <label htmlFor="profession">Profession</label>
                      <input
                        id="profession"
                        name="profession"
                        value={form.profession}
                        onChange={updateForm}
                        placeholder="e.g. Doctor, Nurse"
                      />
                    </div>
                  </div>

                  <div className="create-study-field">
                    <label htmlFor="additional_criteria">
                      Additional audience criteria
                    </label>
                    <textarea
                      id="additional_criteria"
                      name="additional_criteria"
                      rows="4"
                      value={form.additional_criteria}
                      onChange={updateForm}
                      placeholder="e.g. Years of experience, hospital type, location..."
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: SAMPLE QUOTAS */}
              {activeStep === 3 && (
                <div className="create-study-step-content">
                  <div className="create-study-quota-heading">
                    <div>
                      <h3>
                        Quota distribution{" "}
                        <span className="create-study-optional">
                          OPTIONAL
                        </span>
                      </h3>
                      <p>
                        Add respondent targets for specific categories.
                        You can also save your study without quotas.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="create-study-add-quota"
                      onClick={addQuota}
                    >
                      <span aria-hidden="true">＋</span>
                      Add Quota
                    </button>
                  </div>

                  {form.quotas.length === 0 ? (
                    <div className="create-study-quota-empty">
                      <div className="create-study-quota-empty-icon">
                        <span aria-hidden="true">≡</span>
                      </div>
                      <h3>No quotas added</h3>
                      <p>
                        Quotas are optional. You can continue without
                        adding any, or create a quota to define specific
                        respondent targets.
                      </p>
                      <button
                        type="button"
                        className="create-study-empty-add"
                        onClick={addQuota}
                      >
                        ＋ Add your first quota
                      </button>
                    </div>
                  ) : (
                    <div className="create-study-quota-list">
                      {form.quotas.map((quota, index) => (
                        <div
                          className="create-study-quota-row"
                          key={index}
                        >
                          <div className="create-study-quota-row-heading">
                            <strong>Quota {index + 1}</strong>
                            <button
                              type="button"
                              className="create-study-remove-quota"
                              onClick={() => removeQuota(index)}
                            >
                              Remove
                            </button>
                          </div>

                          <div className="create-study-quota-fields">
                            <div className="create-study-field">
                              <label htmlFor={`quota-attribute-${index}`}>
                                Attribute
                              </label>
                              <select
                                id={`quota-attribute-${index}`}
                                value={quota.attribute}
                                onChange={(event) =>
                                  updateQuota(
                                    index,
                                    "attribute",
                                    event.target.value
                                  )
                                }
                                required
                              >
                                {quotaAttributes.map((attribute) => (
                                  <option
                                    key={attribute.value}
                                    value={attribute.value}
                                  >
                                    {attribute.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="create-study-field">
                              <label htmlFor={`quota-category-${index}`}>
                                Category
                              </label>
                              <input
                                id={`quota-category-${index}`}
                                value={quota.category}
                                onChange={(event) =>
                                  updateQuota(
                                    index,
                                    "category",
                                    event.target.value
                                  )
                                }
                                placeholder="e.g. Male, 25–34"
                                maxLength={100}
                                required
                              />
                            </div>

                            <div className="create-study-field">
                              <label htmlFor={`quota-target-${index}`}>
                                Target completes
                              </label>
                              <input
                                id={`quota-target-${index}`}
                                type="number"
                                min="1"
                                value={quota.target_completes}
                                onChange={(event) =>
                                  updateQuota(
                                    index,
                                    "target_completes",
                                    event.target.value
                                  )
                                }
                                placeholder="e.g. 100"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Step navigation */}
            <div className="create-study-navigation">
              <div className="create-study-navigation-left">
                {activeStep > 1 ? (
                  <button
                    type="button"
                    className="create-study-previous"
                    onClick={handlePrevious}
                    disabled={saving}
                  >
                    <span aria-hidden="true">←</span>
                    Previous
                  </button>
                ) : (
                  <button
                    type="button"
                    className="create-study-cancel"
                    onClick={() =>
                      navigate("/client-portal/dashboard")
                    }
                    disabled={saving}
                  >
                    Cancel
                  </button>
                )}
              </div>

              <div className="create-study-navigation-right">
                <span className="create-study-step-caption">
                  Step {activeStep} of 3
                </span>

                {activeStep < 3 ? (
                  <button
                    type="submit"
                    className="create-study-next"
                    disabled={saving}
                  >
                    Continue
                    <span aria-hidden="true">→</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="create-study-submit"
                    disabled={saving}
                  >
                    {saving ? "Creating Study..." : "Create Study"}
                    {!saving && (
                      <span aria-hidden="true">→</span>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </>
      )}
    </div>
  );
}