import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";

// Add VITE_API_URL=http://localhost:5000 to your .env for local dev.
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Register = () => {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const validateForm = () => {

    if(formData.name.trim().length < 3){
      return "Name must contain at least 3 characters.";
    }

    if(!/^\S+@\S+\.\S+$/.test(formData.email)){
      return "Please enter a valid email.";
    }

    if(!/^[0-9]{10}$/.test(formData.phone)){
      return "Phone number must be 10 digits.";
    }

    if(formData.password.length < 6){
      return "Password must contain at least 6 characters.";
    }

    if(formData.password !== formData.confirmPassword){
      return "Passwords do not match.";
    }

    return null;

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    const validationError = validateForm();

    if(validationError){
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try{

      // withCredentials matters here even though this flow doesn't use the
      // token directly: the backend's register controller sets the httpOnly
      // cookie on this same response (setTokenCookie in authController.js).
      // Without withCredentials, the browser silently drops that Set-Cookie
      // header since this is a cross-origin request. Harmless today since
      // we redirect to /login and the user signs in there anyway — but
      // keeps this request consistent with the rest of the app's auth calls.
      await axios.post(
        `${API_BASE_URL}/api/auth/register`,
        {
          name:formData.name,
          email:formData.email,
          phone:formData.phone,
          password:formData.password
        },
        { withCredentials: true }
      );

      setSuccess("Registration Successful!");

      setTimeout(()=>{
        navigate("/login");
      },1500);

    }
    catch(err){

      setError(
        err.response?.data?.message ||
        "Registration Failed."
      );

    }
    finally{
      setLoading(false);
    }

  };

  return(

<div className="register-page">

<div className="register-left">

  <div className="grid-overlay"></div>

  <div className="corner-mark corner-mark--tl"></div>
  <div className="corner-mark corner-mark--br"></div>

  <div className="register-overlay">

    <div className="register-brand">

      <div className="brand-mark">AC</div>

      <h1>AutoCare</h1>

      <p className="brand-tagline">
        Service management, done right
      </p>

    </div>

    <div className="register-info">

      <h2>
        Your service history,<br />in one place
      </h2>

      <p>
        Create an account to book appointments, follow a
        job from drop-off to pickup, and keep every past
        service on record.
      </p>

      <ul>

        <li><span className="bullet-mark"></span> Book a service in minutes</li>

        <li><span className="bullet-mark"></span> Follow live job status</li>

        <li><span className="bullet-mark"></span> Account protected end to end</li>

        <li><span className="bullet-mark"></span> Support when you need it</li>

      </ul>

    </div>

  </div>

</div>

<div className="register-right">

<div className="register-container">

<div className="form-header">

  <h2>Create your account</h2>

  <p>Fill in your details to get started</p>

</div>

{error &&

<div className="error-box">

{error}

</div>

}

{success &&

<div className="success-box">

{success}

</div>

}

<form
className="register-form"
onSubmit={handleSubmit}
>

<div className="form-group">

<label>

Full Name

</label>

<input

type="text"

name="name"

placeholder="Enter full name"

value={formData.name}

onChange={handleChange}

/>

</div>

<div className="form-group">

<label>

Email

</label>

<input

type="email"

name="email"

placeholder="Enter email"

value={formData.email}

onChange={handleChange}

/>

</div>

<div className="form-group">

<label>

Phone

</label>

<input

type="text"

name="phone"

placeholder="Enter mobile number"

value={formData.phone}

onChange={handleChange}

/>

</div>

<div className="form-row">

<div className="form-group">

<label>

Password

</label>

<div className="password-wrapper">

<input

type={showPassword ? "text" : "password"}

name="password"

placeholder="Enter password"

value={formData.password}

onChange={handleChange}

/>

<button

type="button"

className="password-toggle"

onClick={() => setShowPassword(!showPassword)}

aria-label={showPassword ? "Hide password" : "Show password"}

>

{showPassword ? "Hide" : "Show"}

</button>

</div>

</div>

<div className="form-group">

<label>

Confirm Password

</label>

<div className="password-wrapper">

<input

type={showConfirmPassword ? "text" : "password"}

name="confirmPassword"

placeholder="Confirm password"

value={formData.confirmPassword}

onChange={handleChange}

/>

<button

type="button"

className="password-toggle"

onClick={() =>
setShowConfirmPassword(!showConfirmPassword)
}

aria-label={showConfirmPassword ? "Hide password" : "Show password"}

>

{showConfirmPassword ? "Hide" : "Show"}

</button>

</div>

</div>

</div>

<button

type="submit"

className="register-btn"

disabled={loading}

>

{loading ? "Creating account…" : "Create account"}

</button>

</form>

<div className="register-footer">

<p>

Already have an account?

<Link

to="/login"

className="login-link"

>

 Log in

</Link>

</p>

</div>

</div>

</div>

</div>

);

};

export default Register;