import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import buildClient from "../../api/buildClient";

const TicketShowPage = ({ ticket, error, redirectUrl, currentUser }) => {
  const router = useRouter();

  useEffect(() => {
    if (error) {
      toast.error(error, {
        position: toast.POSITION.TOP_CENTER,
      });
      setTimeout(() => router.push(redirectUrl), 2000);
    }
  }, []);

  const handleOrder = async () => {
    if (!currentUser) {
      toast.error("Log in to order a ticket", {
        position: toast.POSITION.TOP_CENTER,
      });
      setTimeout(() => router.push("/auth/signup"), 2000);
    } else {
      try {
        const response = await fetch("/api/orders/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ticketId: ticket.id }),
        });

        if (response.ok) {
          const data = await response.json();
          const orderId = data.id;
          router.push(`/order/${orderId}`);
        } else {
          toast.error("Failed to create order. Please try again later.", {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      } catch (error) {
        toast.error("An error occurred. Please try again later.", {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    }
  };

  return (
    <div className="container mt-5">
      {ticket && (
        <>
          <h1>Ticket Details</h1>
          <div className="card mt-3">
            <div className="card-body">
              <h5 className="card-title">{ticket.title}</h5>
              <p className="card-text">Price: {ticket.price}</p>
              {ticket.orderId ? (
                <p className="text-success">This ticket is already ordered.</p>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={handleOrder}
                  disabled={ticket.orderId !== undefined}
                >
                  {ticket.orderId !== undefined ? "Ordered" : "Order Ticket"}
                </button>
              )}
            </div>
          </div>
        </>
      )}
      <ToastContainer />
    </div>
  );
};

TicketShowPage.getInitialProps = async (context) => {
  try {
    const { ticketId } = context.query;
    const client = buildClient(context);
    const response = await client.get(`/api/tickets/${ticketId}`);

    const ticket = response.data;
    return { ticket };
  } catch (error) {
    const status = error.response.status;
    if (status === 401) {
      // Display unauthorized error, add to history, and redirect to signin page
      const redirectUrl = "/auth/signin";
      return {
        ticket: null,
        error: "Unauthorized. Log in to see ticket details",
        redirectUrl,
      };
    } else if (status === 404) {
      const redirectUrl = "/";
      return { ticket: null, error: "Ticket not Found", redirectUrl };
    } else {
      const redirectUrl = "/";
      return {
        ticket: null,
        error: "Failed to fetch ticket data.",
        redirectUrl,
      };
    }
  }
};

export default TicketShowPage;
