import { useState } from "react";
import axios from "axios";

const signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState([]);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://ticketing.dev/api/users/signup",
        {
          email: email,
          password: password,
        },
        { withCredentials: true }
      );
    } catch (err) {
      const errorBody = err.response.data;
      setErrors(errorBody.errors);
    }
  }

  return (
    <>
      <div className="container">
        <form onSubmit={handleSubmit}>
          <h1>Sign Up</h1>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              className="form-control"
              type="email"
              name="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              className="form-control"
              type="password"
              name="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {errors.length !== 0 ? (
            <div className="alert alert-danger">
              <ul className="my-0">
                {errors.map((error) => (
                  <li>{error.message}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <button className="btn btn-primary">Signup</button>
        </form>
      </div>
    </>
  );
};

export default signup;
