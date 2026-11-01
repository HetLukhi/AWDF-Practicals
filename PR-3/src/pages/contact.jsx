import React from "react";
import { useState } from 'react'

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })

  const [isSubmitted, setIsSubmitted] = useState(false)

  const messageLimit = 250

  const handleChange = (event) => {
    const { name, value } = event.target

    if (name === 'message' && value.length > messageLimit) {
      return
    }

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }))

    setIsSubmitted(false)
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.message.trim()
    ) {
      alert('Please complete all fields.')
      return
    }

    setIsSubmitted(true)
  }

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      message: '',
    })

    setIsSubmitted(false)
  }

  return (
    <section className="page-section">
      <div className="page-heading">
        <p>Get In Touch</p>
        <h1>Contact Me</h1>
        <span>
          Complete the form below to send your message.
        </span>
      </div>

      <div className="contact-layout">
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>

            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
            />

            <small>
              Live input: {formData.name || 'Your name will appear here'}
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>

            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message</label>

            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Write your message"
              rows="7"
            />

            <div className="message-information">
              <small>Your message updates in real time.</small>

              <small>
                {formData.message.length}/{messageLimit} characters
              </small>
            </div>
          </div>

          <div className="form-buttons">
            <button type="submit" className="primary-button">
              Submit Message
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={handleReset}
            >
              Clear Form
            </button>
          </div>

          {isSubmitted && (
            <div className="success-message">
              Thank you, {formData.name}! Your message has been captured
              successfully.
            </div>
          )}
        </form>

        <aside className="live-preview">
          <h2>Live Form Preview</h2>

          <div className="preview-item">
            <strong>Name</strong>
            <p>{formData.name || 'Not entered'}</p>
          </div>

          <div className="preview-item">
            <strong>Email</strong>
            <p>{formData.email || 'Not entered'}</p>
          </div>

          <div className="preview-item">
            <strong>Message</strong>
            <p>{formData.message || 'Your message will appear here.'}</p>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default Contact