import axios from "axios";
import { useState } from "react";
export default function useRequest(url, method) {
  const [errors, setErrors] = useState([]);
  const runFunction = async (body) => {
    try {
      let response = null;
      if (method !== "get") {
        response = await axios[method](url, body, { withCredentials: true });
      } else response = await axios[method](url, { withCredentials: true });
      setErrors([]);
      return response.data;
    } catch (err) {
      setErrors(err.response.data.errors);
    }
  };
  return [runFunction, errors];
}
