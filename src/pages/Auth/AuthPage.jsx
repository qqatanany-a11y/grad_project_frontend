import { useState } from 'react'
import AuthForm from '../../components/auth/AuthForm'
import OverlayPanel from '../../components/auth/OverlayPanel'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^\d{10}$/
const namePattern = /^[A-Za-z\u0600-\u06FF'-]+$/
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

const validateName = (value, label) =>
  namePattern.test(value.trim()) ? '' : `${label} can only contain letters.`

const validatePhoneNumber = (value, label) =>
  phonePattern.test(value.trim()) ? '' : `${label} must be 10 digits only.`

const validateEmail = (value) =>
  emailPattern.test(value.trim()) ? '' : 'Enter a valid email address.'

const validatePassword = (value) =>
  passwordPattern.test(value)
    ? ''
    : 'Password must be at least 8 characters and include uppercase, lowercase, and a number.'

const createNameField = (name, label, autoComplete) => ({
  name,
  type: 'text',
  placeholder: label,
  label,
  autoComplete,
  required: true,
  maxLength: 40,
  validate: (value) => validateName(value, label),
  sanitize: (value) => value.replace(/\d/g, ''),
  wrapperClassName: 'name-part',
})

const createPhoneField = (name, label, autoComplete, required = false) => ({
  name,
  type: 'tel',
  placeholder: required ? label : `${label} (Optional)`,
  label,
  autoComplete,
  inputMode: 'numeric',
  required,
  maxLength: 10,
  validate: (value) => validatePhoneNumber(value, label),
  sanitize: (value) => value.replace(/\D/g, '').slice(0, 10),
})

const emailField = {
  name: 'email',
  type: 'email',
  placeholder: 'Email Address',
  label: 'Email address',
  autoComplete: 'email',
  required: true,
  maxLength: 254,
  validate: validateEmail,
}

const createPasswordField = (autoComplete, withValidation = false) => ({
  name: 'password',
  type: 'password',
  placeholder: 'Password',
  label: 'Password',
  autoComplete,
  required: true,
  maxLength: 64,
  ...(withValidation ? { validate: validatePassword } : {}),
})

const signInFields = [emailField, createPasswordField('current-password')]

const signUpFields = [
  ...[
    ['firstName', 'First Name', 'given-name'],
    ['middleName', 'Middle Name', 'additional-name'],
    ['lastName', 'Last Name', 'family-name'],
  ].map(([name, label, autoComplete]) =>
    createNameField(name, label, autoComplete),
  ),
  createPhoneField('phoneNumber', 'Phone Number', 'tel', true),
  createPhoneField(
    'additionalPhoneNumber',
    'Additional Phone Number',
    'tel-national',
  ),
  emailField,
  createPasswordField('new-password', true),
]

const authPageStyles = `
  .auth-page {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 24px;
    background:
      radial-gradient(circle at top left, rgba(255, 75, 43, 0.18), transparent 34%),
      radial-gradient(circle at bottom right, rgba(255, 65, 108, 0.22), transparent 38%),
      linear-gradient(135deg, #fff7f6 0%, #ffeef1 42%, #fff 100%);
  }

  .auth-page .container {
    position: relative;
    overflow: hidden;
    width: min(100%, 900px);
    min-height: 640px;
    background: #ffffff;
    border-radius: 28px;
    box-shadow:
      0 24px 60px rgba(255, 65, 108, 0.12),
      0 12px 28px rgba(15, 23, 42, 0.12);
  }

  .auth-page .container h1,
  .auth-page .container p {
    margin: 0;
  }

  .auth-page .container h1 {
    color: #1f1f2e;
    font-size: clamp(2rem, 4vw, 2.75rem);
    font-weight: 700;
    letter-spacing: -0.03em;
  }

  .auth-page .container p {
    color: rgba(255, 255, 255, 0.86);
    font-size: 0.96rem;
    line-height: 1.6;
    max-width: 320px;
  }

  .auth-page .form-container {
    position: absolute;
    top: 0;
    height: 100%;
    transition: all 0.6s ease-in-out;
  }

  .auth-page .sign-in-container {
    left: 0;
    width: 50%;
    z-index: 2;
  }

  .auth-page .sign-up-container {
    left: 0;
    width: 50%;
    opacity: 0;
    z-index: 1;
  }

  .auth-page .container.right-panel-active .sign-in-container {
    transform: translateX(100%);
  }

  .auth-page .container.right-panel-active .sign-up-container {
    transform: translateX(100%);
    opacity: 1;
    z-index: 5;
    animation: auth-page-show 0.6s;
  }

  @keyframes auth-page-show {
    0%,
    49.99% {
      opacity: 0;
      z-index: 1;
    }

    50%,
    100% {
      opacity: 1;
      z-index: 5;
    }
  }

  .auth-page form {
    background: #ffffff;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    padding: 32px 56px;
    text-align: center;
    overflow-y: auto;
  }

  .auth-page form h1 {
    margin-bottom: 10px;
  }

  .auth-page .auth-form-sign-up {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    align-content: center;
  }

  .auth-page .auth-form-sign-up h1,
  .auth-page .auth-form-sign-up .field-group:not(.name-part),
  .auth-page .auth-form-sign-up button {
    grid-column: 1 / -1;
  }

  .auth-page .field-group {
    width: 100%;
    text-align: left;
  }

  .auth-page form input {
    width: 100%;
    margin: 0;
    padding: 14px 16px;
    border: 1px solid #f2d7de;
    border-radius: 999px;
    background: #fff7f8;
    color: #2d1e23;
    outline: none;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease,
      background-color 0.2s ease;
  }

  .auth-page form input:focus {
    border-color: #ff5d74;
    background: #ffffff;
    box-shadow: 0 0 0 4px rgba(255, 93, 116, 0.15);
  }

  .auth-page form input[aria-invalid='true'] {
    border-color: #e11d48;
    background: #fff4f6;
  }

  .auth-page form input[aria-invalid='true']:focus {
    box-shadow: 0 0 0 4px rgba(225, 29, 72, 0.14);
  }

  .auth-page .field-error {
    display: block;
    margin: 6px 14px 0;
    color: #d13b59;
    font-size: 0.75rem;
    line-height: 1.4;
  }

  .auth-page button {
    margin-top: 16px;
    padding: 14px 46px;
    border: 1px solid transparent;
    border-radius: 999px;
    background: linear-gradient(135deg, #ff4b2b 0%, #ff416c 100%);
    color: #ffffff;
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.18em;
    cursor: pointer;
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease,
      background-position 0.6s ease-in-out;
  }

  .auth-page button:hover {
    transform: translateY(-1px);
    box-shadow: 0 14px 24px rgba(255, 75, 43, 0.24);
  }

  .auth-page button:active {
    transform: translateY(0);
  }

  .auth-page button:focus-visible {
    outline: 3px solid rgba(255, 75, 43, 0.28);
    outline-offset: 3px;
  }

  .auth-page button.ghost {
    background: transparent;
    border-color: rgba(255, 255, 255, 0.88);
    box-shadow: none;
  }

  .auth-page button.ghost:hover {
    background: rgba(255, 255, 255, 0.12);
    box-shadow: none;
  }

  .auth-page .overlay-container {
    position: absolute;
    top: 0;
    left: 50%;
    width: 50%;
    height: 100%;
    overflow: hidden;
    transition: transform 0.6s ease-in-out;
    z-index: 100;
  }

  .auth-page .container.right-panel-active .overlay-container {
    transform: translateX(-100%);
  }

  .auth-page .overlay {
    position: relative;
    left: -100%;
    width: 200%;
    height: 100%;
    color: #ffffff;
    background:
      radial-gradient(circle at 15% 15%, rgba(255, 255, 255, 0.22), transparent 24%),
      linear-gradient(135deg, #ff4b2b 0%, #ff416c 55%, #ff6f91 100%);
    transform: translateX(0);
    transition: transform 0.6s ease-in-out;
  }

  .auth-page .container.right-panel-active .overlay {
    transform: translateX(50%);
  }

  .auth-page .overlay-panel {
    position: absolute;
    top: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 50%;
    height: 100%;
    padding: 0 48px;
    text-align: center;
    transition: transform 0.6s ease-in-out;
  }

  .auth-page .overlay-panel h1 {
    color: #ffffff;
    margin-bottom: 14px;
  }

  .auth-page .overlay-panel p {
    margin-bottom: 24px;
  }

  .auth-page .overlay-left {
    transform: translateX(-20%);
  }

  .auth-page .container.right-panel-active .overlay-left {
    transform: translateX(0);
  }

  .auth-page .overlay-right {
    right: 0;
    transform: translateX(0);
  }

  .auth-page .container.right-panel-active .overlay-right {
    transform: translateX(20%);
  }

  @media (max-width: 860px) {
    .auth-page {
      padding: 16px;
    }

    .auth-page .container {
      min-height: 700px;
    }

    .auth-page form {
      padding: 28px;
    }

    .auth-page .auth-form-sign-up {
      grid-template-columns: 1fr;
    }

    .auth-page .overlay-panel {
      padding: 0 28px;
    }

    .auth-page button {
      padding-inline: 28px;
    }
  }
`

function AuthPage() {
  const [isSignUpActive, setIsSignUpActive] = useState(false)

  const handleSubmit = () => {}

  return (
    <>
      <style>{authPageStyles}</style>
      <main className="auth-page">
        <div
          className={`container${isSignUpActive ? ' right-panel-active' : ''}`}
        >
          <div className="form-container sign-in-container">
            <AuthForm
              mode="sign-in"
              title="Sign in"
              fields={signInFields}
              buttonLabel="SIGN IN"
              onSubmit={handleSubmit}
            />
          </div>

          <div className="form-container sign-up-container">
            <AuthForm
              mode="sign-up"
              title="Create Account"
              fields={signUpFields}
              buttonLabel="SIGN UP"
              onSubmit={handleSubmit}
            />
          </div>

          <div className="overlay-container">
            <div className="overlay">
              <OverlayPanel
                side="overlay-left"
                title="Plan Your Perfect Event!"
                description="Start crafting your perfect celebration with elegance"
                buttonLabel="SIGN IN"
                onClick={() => setIsSignUpActive(false)}
              />

              <OverlayPanel
                side="overlay-right"
                title="Plan Your Perfect Event!"
                description="Enter your personal details and start your journey with us"
                buttonLabel="SIGN UP"
                onClick={() => setIsSignUpActive(true)}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default AuthPage
