import NewTicketForm from "../../components/NewTicketForm";

export default function newTicket({ currentUser }) {
  return (
    <>
      <h1>Create new Ticket</h1>
      <NewTicketForm currentUser={currentUser} />
    </>
  );
}
