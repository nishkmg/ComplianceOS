/**
 * E-way-bill NIC (National Informatics Centre) sandbox adapter.
 *
 * Two modes:
 * - Live: POST to EWB_SANDBOX_URL (NIC sandbox endpoint)
 * - Mock: EWB_SANDBOX_URL unset → synthetic response
 */

export interface EwbPartA {
  docType: "INV" | "CHL" | "CRN" | "DBN";
  docNo: string;
  docDate: string;
  fromGstin: string;
  fromTrdName: string;
  toGstin: string;
  toTrdName: string;
  totalValue: number;
  gstRate: number;
  cessRate: number;
  transId: string;
  transName: string;
  distance: number;
}

export interface EwbPartB {
  vehicleNo: string;
  transportDocNo: string;
  transportDocDate: string;
}

export interface EwbResponse {
  ewbNo: string;
  ewbDt: string;
  ewbValidTill: string;
}

export async function generateEwayBill(
  partA: EwbPartA,
  partB?: EwbPartB,
): Promise<EwbResponse> {
  const ewbUrl = process.env.EWB_SANDBOX_URL || "";

  if (!ewbUrl) {
    const ewbNo = Date.now().toString().slice(-12);
    return {
      ewbNo,
      ewbDt: new Date().toISOString(),
      ewbValidTill: new Date(
        Date.now() + 15 * 24 * 3600 * 1000,
      ).toISOString(),
    };
  }

  const body: Record<string, unknown> = { ...partA };
  if (partB) {
    body.vehicleNo = partB.vehicleNo;
  }

  const res = await fetch(`${ewbUrl}/ewaybill`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`EWB error ${res.status}: ${await res.text()}`);
  }

  return res.json() as Promise<EwbResponse>;
}

export async function cancelEwayBill(
  ewbNo: string,
  reason: string,
): Promise<void> {
  const ewbUrl = process.env.EWB_SANDBOX_URL;
  if (!ewbUrl) return;

  const res = await fetch(`${ewbUrl}/ewaybill/${ewbNo}/cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ewbNo, cancelRsnCode: "1", cancelRsn: reason }),
  });

  if (!res.ok) {
    throw new Error(`EWB cancel error ${res.status}: ${await res.text()}`);
  }
}

export async function extendValidity(
  ewbNo: string,
  additionalDistance: number,
): Promise<{ ewbValidTill: string }> {
  const ewbUrl = process.env.EWB_SANDBOX_URL;
  if (!ewbUrl) {
    return {
      ewbValidTill: new Date(
        Date.now() + 15 * 24 * 3600 * 1000,
      ).toISOString(),
    };
  }

  const res = await fetch(`${ewbUrl}/ewaybill/${ewbNo}/extend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ewbNo, extendedDistance: additionalDistance }),
  });

  if (!res.ok) {
    throw new Error(`EWB extend error ${res.status}: ${await res.text()}`);
  }

  return res.json() as Promise<{ ewbValidTill: string }>;
}
