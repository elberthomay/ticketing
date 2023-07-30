import Link from "next/link";
export default function Header({ currentUser }) {
  // filter links. depending on whether currentUser is defined, individual link will
  // evaluate to false or label link object
  const links = [
    !currentUser && { label: "Sign In", href: "/auth/signin" },
    !currentUser && { label: "Sign Up", href: "/auth/signup" },
    currentUser && { label: "New Tickets", href: "/ticket/new" },
    currentUser && { label: "Your Tickets", href: "/ticket" },
    currentUser && { label: "Orders", href: "/order" },
    currentUser && { label: "Sign Out", href: "/auth/signout" },
  ]
    .filter((link) => link)
    .map((link) => (
      <li key={link.label} className="nav-item">
        <Link className="nav-link active" aria-current="page" href={link.href}>
          {link.label}
        </Link>
      </li>
    ));

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        <Link className="navbar-brand" href="/">
          GitTX
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="d-flex justify-content-end" id="navbarNav">
          <ul className="navbar-nav d-flex align-items-center">
            {links}

            {/* <li class="nav-item">
              <a class="nav-link" href="#">
                Features
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">
                Pricing
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link disabled">Disabled</a>
            </li> */}
          </ul>
        </div>
      </div>
    </nav>
  );
}
