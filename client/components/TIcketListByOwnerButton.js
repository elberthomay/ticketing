import React from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Link from "next/link";

const TicketListbyOwnerButton = ({ ticket }) => {
  const router = useRouter();

  const handleDelete = async () => {
    try {
      const response = await axios.delete(`/api/tickets/${ticket.id}`);

      if (response.status === 200) {
        router.push("/ticket");
      } else {
        console.log("Failed to delete the ticket."); // You can add error handling or display an error message if needed
      }
    } catch (error) {
      console.log("An error occurred while deleting the ticket:", error);
    }
  };

  return (
    <div>
      <button
        className="btn btn-warning"
        disabled={ticket.orderId !== undefined}
      >
        <Link style={{ color: "white" }} href={`/ticket/update/${ticket.id}`}>
          Update
        </Link>
      </button>
      <button
        className="btn btn-danger"
        disabled={ticket.orderId !== undefined}
        onClick={handleDelete}
      >
        Delete
      </button>
    </div>
  );
};

export default TicketListbyOwnerButton;
