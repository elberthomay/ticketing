import React, { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import buildClient from "../../api/buildClient";

const OrderListPage = ({ orders, error }) => {
  const router = useRouter();

  useEffect(() => {
    if (error) {
      toast.error(error, {
        position: toast.POSITION.TOP_CENTER,
      });
      setTimeout(() => router.push("/auth/signin"), 2000);
    }
  }, []);

  return (
    <div className="container mt-5">
      <h1>Order List</h1>
      <table className="table mt-3">
        <thead>
          <tr>
            <th>Ticket ID</th>
            <th>Ticket Name</th>
            <th>Ticket Price</th>
            <th>Order Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.ticket.id}</td>
              <td>{order.ticket.title}</td>
              <td>{order.ticket.price}</td>
              <td>{order.status}</td>
              <td>
                <Link className="btn btn-primary" href={`/order/${order.id}`}>
                  Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ToastContainer />
    </div>
  );
};

OrderListPage.getInitialProps = async (context) => {
  try {
    const client = buildClient(context);
    const response = await client.get("/api/orders/");

    const orders = response.data;
    return { orders };
  } catch (error) {
    const status = error.response.status;
    if (status === 401) {
      // Redirect to login page and store the current URL in session storage
      return {
        orders: [],
        error: "Unauthorized. You have to Log in to view this Page",
      };
    } else {
      return { orders: [], error: "Failed to fetch order data." };
    }
  }
};

export default OrderListPage;
