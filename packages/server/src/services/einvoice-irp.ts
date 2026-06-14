export interface IrnResult {
  irn: string;
  signedQrCode: string;
  irnGeneratedAt: string;
  ackNo: string;
  ackDt: string;
}

export interface CancelIrnInput {
  Irn: string;
  CancelRsnCode: string;
  CancelRsn: string;
}

/**
 * NIC IRP sandbox adapter.
 * Sandbox: https://einv-apisandbox.nic.in/eicore/v1.03/Invoice
 * Prod: https://einvoice1.gst.gov.in/ (via NIC)
 *
 * Mock mode when IRP_SANDBOX_URL env var not set.
 */
export async function generateIrn(
  invoiceData: unknown,
  tenantGstin: string,
): Promise<IrnResult> {
  const sandboxUrl = process.env.IRP_SANDBOX_URL || "";
  const username = process.env.IRP_USERNAME || "";
  const password = process.env.IRP_PASSWORD || "";

  if (!sandboxUrl) {
    const irn = Date.now().toString(36).toUpperCase().padStart(16, "0");
    return {
      irn,
      signedQrCode: "",
      irnGeneratedAt: new Date().toISOString(),
      ackNo: `ACK-${irn}`,
      ackDt: new Date().toISOString(),
    };
  }

  const authHeader = "Basic " + Buffer.from(`${username}:${password}`).toString("base64");

  const res = await fetch(`${sandboxUrl}/eicore/v1.03/Invoice`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "gstin": tenantGstin,
      "Authorization": authHeader,
    },
    body: JSON.stringify(invoiceData),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`IRP error ${res.status}: ${body}`);
  }

  return res.json() as Promise<IrnResult>;
}

export async function cancelIrn(
  irn: string,
  tenantGstin: string,
): Promise<void> {
  const irpUrl = process.env.IRP_SANDBOX_URL;
  const username = process.env.IRP_USERNAME || "";
  const password = process.env.IRP_PASSWORD || "";

  if (!irpUrl) return;

  const authHeader = "Basic " + Buffer.from(`${username}:${password}`).toString("base64");

  const body: CancelIrnInput = {
    Irn: irn,
    CancelRsnCode: "1",
    CancelRsn: "Duplicate",
  };

  const res = await fetch(`${irpUrl}/eicore/v1.03/Invoice`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "gstin": tenantGstin,
      "Authorization": authHeader,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`IRP cancel error ${res.status}: ${text}`);
  }
}
