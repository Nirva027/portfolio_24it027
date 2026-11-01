import { useState } from 'react';

function Contact() {
  const [message, setMessage] = useState('');

  return (
    <section className="route-page contact-page" aria-labelledby="contact-title">
      <div className="page-heading">
        <p className="eyebrow">LET’S START A CONVERSATION</p>
        <h1 id="contact-title">
          Say <span>hello.</span>
        </h1>
        <p className="page-intro">
          Have an idea, a question, or a recommendation? I’d love to hear from
          you.
        </p>
      </div>

      <form className="contact-form" onSubmit={(event) => event.preventDefault()}>
        <label htmlFor="contact-message">Your message</label>
        <textarea
          id="contact-message"
          name="message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Write a note..."
          rows={5}
        />
        <div className="message-preview" aria-live="polite">
          <span className="preview-label">LIVE PREVIEW</span>
          <p>
            {message || 'Your message will appear here as you type.'}
          </p>
        </div>
        <a className="text-link" href="mailto:nirva.hadvani@example.com">
          Email Nirva <span aria-hidden="true">↗</span>
        </a>
      </form>
    </section>
  );
}

export default Contact;
