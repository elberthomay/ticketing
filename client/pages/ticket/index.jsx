import TicketListbyOwnerButton from "../../components/TIcketListByOwnerButton";
import TicketList from "../../components/TicketList";

export default function ticket() {
  return (
    <div className="container">
      <h1>Your currently Sold Ticket</h1>
      <TicketList
        url={"/api/tickets/byOwner/"}
        buttonComponent={TicketListbyOwnerButton}
      />
    </div>
  );
}
