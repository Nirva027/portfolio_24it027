import { Mail, MapPin, Send } from "lucide-react";
import { useState } from "react";

const GithubIcon = ({ size = 20, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({ size = 20, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="section-header" style={{ marginBottom: "40px" }}>
        <h1 className="section-title"><span className="gradient-text">Get In Touch</span></h1>
        <p style={{ marginTop: "8px" }}>Have a project proposal, question, or just want to say hello? Drop a message!</p>
      </div>

      <div className="contact-layout">
        {/* Info Column */}
        <div className="glass-card contact-info-card">
          <h2 className="card-subtitle gradient-text">Contact Information</h2>
          <p style={{ margin: "16px 0 32px 0" }}>
            I am always open to discussing new projects, creative ideas, or opportunities to be part of your visions.
          </p>

          <div className="info-item-list">
            <div className="info-item">
              <Mail className="info-icon" size={20} />
              <div>
                <h4>Email</h4>
                <a href="mailto:nirva.hadvani@example.com">nirva.hadvani@example.com</a>
              </div>
            </div>
            
            <div className="info-item" style={{ marginTop: "24px" }}>
              <MapPin className="info-icon" size={20} />
              <div>
                <h4>Location</h4>
                <p style={{ fontSize: "1rem" }}>Gujarat, India</p>
              </div>
            </div>
          </div>

          <div className="contact-socials-wrapper" style={{ marginTop: "48px" }}>
            <h4>Follow Me</h4>
            <div className="contact-socials">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn">
                <GithubIcon size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn">
                <LinkedinIcon size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <div className="glass-card contact-form-card">
          {submitted ? (
            <div className="success-message animate-fade-in" style={{ textAlign: "center", padding: "40px 0" }}>
              <div className="success-icon-wrapper">
                <Send size={48} className="success-icon" />
              </div>
              <h2 style={{ marginTop: "24px" }}>Message Sent!</h2>
              <p style={{ marginTop: "12px" }}>
                Thank you for reaching out. I'll get back to you as soon as possible.
              </p>
              <button className="btn btn-primary" style={{ marginTop: "24px" }} onClick={() => setSubmitted(false)}>
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name" className="form-label">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message" className="form-label">Message</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell me about your project..."
                  className="form-control"
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "8px" }}>
                <span>Send Message</span>
                <Send size={18} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Contact;
