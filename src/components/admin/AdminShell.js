import React from "react";
import { Container } from "react-bootstrap";
import AdminHeader from "../decoraciones/AdminHeader";
import AdminGuard from "./AdminGuard";
import AdminFooter from "./AdminFooter";
import "./admin.css";

const AdminShell = ({
  children,
  contentClassName = "flex-grow-1 py-4",
  containerClassName = "",
}) => {
  return (
    <AdminGuard>
      <div className="admin-shell min-vh-100 d-flex flex-column">
        <div className="admin-shell__backdrop" aria-hidden="true" />
        <AdminHeader />
        <main className={`admin-shell__main ${contentClassName}`}>
          <Container className={`admin-shell__container ${containerClassName}`}>
            {children}
          </Container>
        </main>
        <AdminFooter />
      </div>
    </AdminGuard>
  );
};

export default AdminShell;
