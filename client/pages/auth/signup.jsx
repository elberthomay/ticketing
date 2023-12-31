import { useState } from "react";
import Router from "next/router";
import useRequest from "../../hooks/useRequest";

const signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [runSignup, errors] = useRequest("/api/users/signup", "post");

  async function handleSubmit(e) {
    e.preventDefault();
    const data = await runSignup({
      email: email,
      password: password,
    });
    if (data) Router.push("/");
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
          {errors && errors?.length !== 0 ? (
            <div className="alert alert-danger">
              <ul className="my-0">
                {errors.map((error) => (
                  <li key={error.field}>{error.message}</li>
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
