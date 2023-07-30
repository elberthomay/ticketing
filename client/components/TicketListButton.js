import Link from "next/link";

export default function TicketListButton({ ticket }) {
  return (
    <div>
      <button
        className="btn btn-primary"
        disabled={ticket.orderId !== undefined}
      >
        <Link style={{ color: "white" }} href={`/ticket/${ticket.id}`}>
          Details
        </Link>
      </button>
    </div>
  );
}
