import TicketList from "../components/TicketList";
import TicketListButton from "../components/TicketListButton";

const index = ({ currentUser }) => {
  return (
    <div className="container">
      <>
        <h1>List of Tickets</h1>
        <TicketList url={"/api/tickets/"} buttonComponent={TicketListButton} />
      </>
      ;
    </div>
  );
};

export default index;
