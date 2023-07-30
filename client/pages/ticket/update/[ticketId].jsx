import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import buildClient from "../../../api/buildClient";
import axios from "axios";

const TicketUpdateForm = ({ currentUser, ticket, error }) => {
  const router = useRouter();
  const [title, setTitle] = useState(ticket ? ticket.title : "");
  const [price, setPrice] = useState(ticket ? ticket.price : "");

  useEffect(() => {
    // Check if currentUser is defined, if not, redirect to signin page
    if (!currentUser || error) {
      toast.error(
        !currentUser
          ? "Unauthorized. Please log in to update a ticket."
          : error,
        {
          position: toast.POSITION.TOP_CENTER,
        }
      );
      setTimeout(() => router.push(!currentUser ? "/auth/signin" : "/"), 2000);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(`/api/tickets/${ticket.id}`, {
        title,
        price,
      });

      if (response.status === 200) {
        toast.success("Ticket updated successfully!", {
          position: toast.POSITION.TOP_CENTER,
        });
        router.push("/ticket");
      } else if (response.status === 401) {
        toast.error("Unauthorized. Please log in to update the ticket.", {
          position: toast.POSITION.TOP_CENTER,
        });
        router.push("/ticket");
      } else {
        toast.error("Failed to update the ticket. Please try again later.", {
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
    <div className="container mt-5">
      <h1>Update Ticket</h1>
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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Update
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

TicketUpdateForm.getInitialProps = async (context) => {
  try {
    const { ticketId } = context.query;
    const client = buildClient(context);
    const response = await client.get(`/api/tickets/${ticketId}`);
    const ticket = response.data;
    return { ticket };
  } catch (error) {
    const status = error.response.status;
    if (status === 401 || status === 404 || status === 400) {
      return {
        ticket: null,
        error: "You're not allowed to change this ticket.",
      };
    } else {
      return { ticket: null, error: "Failed to fetch ticket data." };
    }
  }
};

export default TicketUpdateForm;
