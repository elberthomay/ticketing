import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function NewTicketForm({ currentUser }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    price: "",
  });

  useEffect(() => {
    if (!currentUser) {
      toast.error("Unauthorized. Please Log in to create a new Ticket", {
        position: toast.POSITION.TOP_CENTER,
      });
      router.push("/auth/signin");
    }
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch("/api/tickets/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Ticket created successfully!", {
          position: toast.POSITION.TOP_CENTER,
        });
        router.push("/ticket");
      } else {
        toast.error("Failed to create ticket. Please try again later.", {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    } catch (error) {
      toast.error("An error occurred. Please try again later.", {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="title" className="form-label">
            Ticket Title
          </label>
          <input
            type="text"
            className="form-control"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="price" className="form-label">
            Price
          </label>
          <input
            type="number"
            className="form-control"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>
      <ToastContainer />
    </>
  );
}
