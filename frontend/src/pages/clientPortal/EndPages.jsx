
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ClientInfoPages.css";

const backendBaseUrl =
  "https://carpenter-trodden-upstate.ngrok-free.dev";

const endPages = [
  {
    name: "Complete",
    status: 1,
    url: `${backendBaseUrl}/api/simple-process/?status=1&pid={{OBID}}`,
    description: "Respondent successfully completed the survey.",
  },
  {
    name: "Terminate",
    status: 2,
    url: `${backendBaseUrl}/api/simple-process/?status=2&pid={{OBID}}`,
    description: "Respondent was terminated from the survey.",
  },
  {
    name: "Quota Full",
    status: 3,
    url: `${backendBaseUrl}/api/simple-process/?status=3&pid={{OBID}}`,
    description: "The required survey quota has been filled.",
  },
  {
    name: "Security",
    status: 4,
    url: `${backendBaseUrl}/api/simple-process/?status=4&pid={{OBID}}`,
    description: "Respondent was rejected due to a security check.",
  },
];

export default function EndPages() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState("");

  const copyUrl = async (name, url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(name);
      setTimeout(() => setCopied(""), 2000);
    } catch {
      window.prompt("Copy this URL:", url);
    }
  };

  return (
    <div className="client-info-page">
      <div className="client-info-page-header">
        <div>
          <h1>End Pages</h1>
          <p>Survey respondent redirect URLs</p>
        </div>

        <button onClick={() => navigate("/client-portal/dashboard")}>
          Back to Dashboard
        </button>
      </div>

      <div className="client-info-card">
        <h2>Respondent Redirect Links</h2>
        <p>
          Copy the appropriate URL and use it in your survey platform
          for the corresponding respondent outcome.
        </p>

        {endPages.map((page) => (
          <div className="end-page-item" key={page.name}>
            <div className="end-page-details">
              <h3>{page.name}</h3>
              <p>{page.description}</p>
              <code>{page.url}</code>
            </div>

            <button
              className="client-copy-button"
              onClick={() => copyUrl(page.name, page.url)}
            >
              {copied === page.name ? "Copied!" : "Copy URL"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
