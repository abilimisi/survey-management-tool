import { FaLinkedin } from "react-icons/fa";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-left">
        © 2026 Opinion Bunch. All rights reserved.
      </div>

      <div className="footer-right">
        <a
          href="https://www.linkedin.com/company/opinion-bunch/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaLinkedin size={22} />
        </a>
      </div>
    </footer>
  );
}

export default Footer;