import React, { useEffect, useState } from "react";
import useRequest from "../hooks/useRequest";
import TicketListButton from "./TicketListButton";

export default function TicketList({ url, buttonComponent }) {
  const [tickets, setTickets] = useState([]);
  const [getTickets, error] = useRequest(url, "get");

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const ticketData = await getTickets();
        setTickets(ticketData);
      } catch (error) {
        // Handle error
        console.error("Error fetching tickets:", error);
      }
    };

    fetchTickets();
  }, [getTickets]);

  return (
    <>
      <div className="d-flex flex-wrap">
        {tickets.map((ticket) => (
          <div className="card m-2" style={{ width: "18rem" }} key={ticket.id}>
            <div className="card-body">
              <h5 className="card-title">{ticket.title}</h5>
              <h6 className="card-subtitle mb-2 text-body-secondary">
                Price: {ticket.price}$
              </h6>
              {buttonComponent({ ticket })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
