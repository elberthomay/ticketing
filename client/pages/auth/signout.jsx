import axios from "axios";
import Router from "next/router";
import { useEffect } from "react";

function performSignout() {
  try {
    axios.get("/api/users/signout").then(() => {
      setTimeout(() => {
        Router.push("/");
      }, 2000);
    });
  } catch (err) {}
}

const signout = () => {
  useEffect(performSignout, []);
  return <h1>You've been signed out</h1>;
};

export default signout;
