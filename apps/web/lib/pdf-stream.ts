/**
 * PDF streaming utility.
 * Proxies PDF from a signed URL, streaming response body without buffering.
 * Prevents OOM for large PDFs (>10MB) on the server.
 */
export async function streamPdf(
  pdfUrl: string,
  filename: string,
): Promise<Response> {
  const pdfRes = await fetch(pdfUrl);
  if (!pdfRes.ok) {
    throw new Error("PDF source not available");
  }
  const contentType = pdfRes.headers.get("content-type") || "application/pdf";

  return new Response(pdfRes.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
