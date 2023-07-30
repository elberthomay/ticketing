import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import buildClient from "../../api/buildClient";
import StripeCheckout from "react-stripe-checkout";
import axios from "axios";

const OrderShowPage = ({ order, error, currentUser }) => {
  const router = useRouter();
  const [timeRemaining, setTimeRemaining] = useState("");
  const [timerExpired, setTimerExpired] = useState(
    order ? order.status === "Complete" || order.status === "Cancelled" : false
  );
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  useEffect(() => {
    if (error || !currentUser) {
      toast.error(!currentUser ? "Unauthorized, Please Log in" : error, {
        position: toast.POSITION.TOP_CENTER,
      });
      setTimeout(
        () => router.push(!currentUser ? "/auth/signin" : "/order"),
        2000
      );
    }
  }, []);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const currentTime = Date.now();
      const expiresAt = order ? order.expiresAt : 0;
      const remainingTime = Math.max(0, expiresAt - currentTime);
      const minutes = Math.floor(remainingTime / 1000 / 60);
      const seconds = Math.floor((remainingTime / 1000) % 60);
      setTimeRemaining(
        `${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`
      );

      if (remainingTime === 0) {
        setTimerExpired(true);
      }
    };

    // Update time remaining every second
    const timerId = setInterval(calculateTimeRemaining, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, [order]);

  const handlePayment = async (token) => {
    try {
      const { data } = await axios.post("/api/payments/", {
        orderId: order.id,
        token: token.id,
      });
      toast.success("Payment successful!", {
        position: toast.POSITION.TOP_CENTER,
      });
      router.push(`/order/${order.id}`);
    } catch (error) {
      const status = error.response.status;
      if (status === 409) {
        toast.error("Order is not awaiting payment", {
          position: toast.POSITION.TOP_CENTER,
        });
      } else {
        toast.error("Order payment failed", {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    }
  };

  const handleCancelOrder = async () => {
    setShowConfirmationModal(false);

    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Order cancelled successfully!", {
          position: toast.POSITION.TOP_CENTER,
        });
        setTimeout(() => router.push("/order"), 2000);
      } else {
        toast.error("Failed to cancel the order. Please try again later.", {
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
      <h1>Order Details</h1>
      {order && (
        <>
          <div className="card mt-3">
            <div className="card-body">
              <h5 className="card-title">Order ID: {order.id}</h5>
              <p className="card-text">Status: {order.status}</p>
              <p className="card-text">Ticket Title: {order.ticket.title}</p>
              <p className="card-text">Ticket Price: {order.ticket.price}$</p>
              {!timerExpired && (
                <p className="card-text">Expires In: {timeRemaining}</p>
              )}
              {timerExpired ? (
                <p className="text-danger">
                  This order is not awaiting payment.
                </p>
              ) : (
                <>
                  <StripeCheckout
                    token={(token) => {
                      handlePayment(token);
                    }}
                    stripeKey="pk_test_51NXwYLHfuDplnizER8qYMjhY1CtpV88gKV0jfY4wZ1QHkJV3lKbzCGmy4sD3PnqENERdOUG0U8uwfuwKR29hmDCG00bddzGBk2"
                    amount={Math.round(parseFloat(order.ticket.price) * 100)}
                    email={currentUser.email}
                  />
                  <button
                    className="btn btn-danger"
                    data-bs-toggle="modal"
                    data-bs-target="#confirmationModal"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
      <div
        className="modal fade"
        id="confirmationModal"
        tabIndex={-1}
        aria-labelledby="confirmationModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Cancel Order Confirmation</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to cancel this order?</p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                No, Keep Order
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleCancelOrder}
              >
                Yes, Cancel Order
              </button>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

OrderShowPage.getInitialProps = async (context) => {
  const { orderId } = context.query;
  const client = buildClient(context);
  try {
    const response = await client.get(`/api/orders/${orderId}`);
    const order = response.data;
    return { order };
  } catch (error) {
    const status = error.response.status;
    if (status === 401) {
      return {
        order: null,
        error: "You are not authorized to view this page.",
      };
    } else if (status === 404 || status === 400) {
      return {
        order: null,
        error: "Order not Found",
      };
    } else {
      return { order: null, error: "Failed to fetch order data." };
    }
  }
};

export default OrderShowPage;
