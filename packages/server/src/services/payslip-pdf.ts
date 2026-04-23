// @ts-nocheck
import puppeteer from "puppeteer";

interface PayslipData {
  employeeName: string;
  employeeCode: string;
  periodMonth: number;
  periodYear: number;
  earnings: Array<{ label: string; amount: number }>;
  deductions: Array<{ label: string; amount: number }>;
  grossSalary: number;
  netSalary: number;
  totalDeductions: number;
}

export async function generatePayslipPDF(data: PayslipData): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    
    const payslipHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .header h1 { margin: 0; color: #1a1a1a; }
            .header p { margin: 5px 0; color: #666; }
            .employee-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .info-group { }
            .info-label { font-weight: bold; color: #666; font-size: 12px; }
            .info-value { font-size: 14px; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background: #f5f5f5; padding: 12px; text-align: left; border: 1px solid #ddd; font-weight: 600; }
            td { padding: 10px 12px; border: 1px solid #ddd; }
            .amount { text-align: right; }
            .section-title { font-size: 16px; font-weight: 600; margin: 20px 0 10px; color: #333; }
            .total-row { font-weight: bold; background: #f9f9f9; }
            .net-salary { font-size: 18px; font-weight: bold; color: #1a1a1a; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 11px; color: #999; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>PAYSLIP</h1>
            <p>${new Date(data.periodYear, data.periodMonth - 1).toLocaleString("default", { month: "long", year: "numeric" })}</p>
          </div>

          <div class="employee-info">
            <div class="info-group">
              <div class="info-label">Employee Name</div>
              <div class="info-value">${data.employeeName}</div>
            </div>
            <div class="info-group">
              <div class="info-label">Employee Code</div>
              <div class="info-value">${data.employeeCode}</div>
            </div>
          </div>

          <div class="section-title">Earnings</div>
          <table>
            <thead>
              <tr>
                <th>Component</th>
                <th class="amount">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${data.earnings.map(e => `
                <tr>
                  <td>${e.label}</td>
                  <td class="amount">₹${e.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                </tr>
              `).join("")}
              <tr class="total-row">
                <td>Gross Earnings</td>
                <td class="amount">₹${data.grossSalary.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>

          <div class="section-title">Deductions</div>
          <table>
            <thead>
              <tr>
                <th>Component</th>
                <th class="amount">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${data.deductions.map(d => `
                <tr>
                  <td>${d.label}</td>
                  <td class="amount">₹${d.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                </tr>
              `).join("")}
              <tr class="total-row">
                <td>Total Deductions</td>
                <td class="amount">₹${data.totalDeductions.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>

          <div class="section-title">Summary</div>
          <table>
            <tr class="net-salary">
              <td>Net Salary</td>
              <td class="amount">₹${data.netSalary.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
            </tr>
          </table>

          <div class="footer">
            <p>This is a computer-generated payslip and does not require a signature.</p>
            <p>For any queries, please contact the HR department.</p>
          </div>
        </body>
      </html>
    `;

    await page.setContent(payslipHtml);
    
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
