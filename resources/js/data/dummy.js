// ─── Dummy Buyers ────────────────────────────────────────────────────────────
export const dummyBuyers = [
  {
    id: "b1",
    email: "procurement@astraindo.co.id",
    company_name: "PT Astra Indonesia",
    pic_name: "Budi Santoso",
    assigned_sales: "Andi Wijaya",
    status: "Active",
    registration_date: "2024-11-10T08:00:00Z",
  },
  {
    id: "b2",
    email: "purchasing@telkomsel.com",
    company_name: "Telkomsel",
    pic_name: "Dewi Kusuma",
    assigned_sales: "Sari Indah",
    status: "Active",
    registration_date: "2024-12-01T09:30:00Z",
  },
  {
    id: "b3",
    email: "vendor@pertamina.co.id",
    company_name: "PT Pertamina",
    pic_name: "Reza Mahendra",
    assigned_sales: "Andi Wijaya",
    status: "Active",
    registration_date: "2025-01-05T10:00:00Z",
  },
  {
    id: "b4",
    email: "supply@unilever.co.id",
    company_name: "Unilever Indonesia",
    pic_name: "Linda Hartono",
    assigned_sales: "Bagas Pratama",
    status: "Inactive",
    registration_date: "2025-01-20T14:00:00Z",
  },
  {
    id: "b5",
    email: "procurement@blibli.com",
    company_name: "Blibli Commerce",
    pic_name: "Fajar Nugroho",
    assigned_sales: "Sari Indah",
    status: "Active",
    registration_date: "2025-02-08T11:00:00Z",
  },
  {
    id: "b6",
    email: "ops@gojek.com",
    company_name: "PT GoTo Gojek",
    pic_name: "Nadia Putri",
    assigned_sales: "Bagas Pratama",
    status: "Active",
    registration_date: "2025-02-15T09:00:00Z",
  },
];

// ─── Dummy Emails ─────────────────────────────────────────────────────────────
export const dummyEmails = [
  {
    id: "e1",
    sender_email: "procurement@astraindo.co.id",
    receiver_email: "andi.wijaya@company.com",
    subject: "Request for Quotation - Spare Parts Q1 2025",
    received_date: "2025-02-20T08:15:00Z",
    due_date: "2025-02-22",
    first_reply_date: "2025-02-20T10:30:00Z",
    sla_status: "On-Time",
  },
  {
    id: "e2",
    sender_email: "purchasing@telkomsel.com",
    receiver_email: "sari.indah@company.com",
    subject: "Follow Up: Network Equipment Proposal",
    received_date: "2025-02-21T09:00:00Z",
    due_date: "2025-02-25",
    first_reply_date: "2025-02-22T16:45:00Z",
    sla_status: "Overdue",
  },
  {
    id: "e3",
    sender_email: "vendor@pertamina.co.id",
    receiver_email: "andi.wijaya@company.com",
    subject: "Tender Inquiry - Pipeline Maintenance Services",
    received_date: "2025-02-22T11:00:00Z",
    due_date: "2025-02-28",
    first_reply_date: null,
    sla_status: "Pending",
  },
  {
    id: "e4",
    sender_email: "procurement@blibli.com",
    receiver_email: "sari.indah@company.com",
    subject: "Annual Contract Renewal - Logistics",
    received_date: "2025-02-23T08:30:00Z",
    due_date: "2025-03-05",
    first_reply_date: "2025-02-23T12:00:00Z",
    sla_status: "On-Time",
  },
  {
    id: "e5",
    sender_email: "ops@gojek.com",
    receiver_email: "bagas.pratama@company.com",
    subject: "Partnership Proposal - Last Mile Delivery",
    received_date: "2025-02-24T10:00:00Z",
    due_date: "2025-03-03",
    first_reply_date: null,
    sla_status: "Pending",
  },
  {
    id: "e6",
    sender_email: "supply@unilever.co.id",
    receiver_email: "bagas.pratama@company.com",
    subject: "RFQ - Packaging Material 2025",
    received_date: "2025-02-18T07:45:00Z",
    due_date: "2025-02-20",
    first_reply_date: "2025-02-19T09:00:00Z",
    sla_status: "On-Time",
  },
  {
    id: "e7",
    sender_email: "purchasing@telkomsel.com",
    receiver_email: "sari.indah@company.com",
    subject: "Urgent: Server Rack Availability",
    received_date: "2025-02-25T14:00:00Z",
    due_date: "2025-03-10",
    first_reply_date: null,
    sla_status: "Pending",
  },
  {
    id: "e8",
    sender_email: "procurement@astraindo.co.id",
    receiver_email: "andi.wijaya@company.com",
    subject: "PO Confirmation - Assembly Line Parts",
    received_date: "2025-02-17T08:00:00Z",
    due_date: "2025-02-19",
    first_reply_date: "2025-02-19T15:30:00Z",
    sla_status: "Overdue",
  },
];

// ─── Derived helpers ──────────────────────────────────────────────────────────

/** Get company name from buyer email */
export function getCompanyName(senderEmail, buyers = dummyBuyers) {
  return buyers.find((b) => b.email === senderEmail)?.company_name ?? "Unregistered";
}

/** Get assigned sales from buyer email */
export function getAssignedSales(senderEmail, buyers = dummyBuyers) {
  return buyers.find((b) => b.email === senderEmail)?.assigned_sales ?? "Unassigned";
}

/** All unique sales names */
export const salesNames = [...new Set(dummyBuyers.map((b) => b.assigned_sales))];
