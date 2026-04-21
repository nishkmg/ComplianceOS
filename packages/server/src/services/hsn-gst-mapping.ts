// packages/server/src/services/hsn-gst-mapping.ts

const HSN_GST_DEFAULTS: Record<string, number> = {
  "610910": 12, "620520": 12, "640351": 18, "847130": 18,
  "851712": 18, "300490": 12, "190590": 12, "852872": 28,
  "220210": 18, "482010": 18,
};

export function getGstRateForHsn(hsnCode: string): number {
  if (HSN_GST_DEFAULTS[hsnCode]) return HSN_GST_DEFAULTS[hsnCode];
  const prefix4 = hsnCode.slice(0, 4);
  if (HSN_GST_DEFAULTS[prefix4]) return HSN_GST_DEFAULTS[prefix4];
  return 18; // Default to 18%
}

export function suggestHsnCode(searchTerm: string): Array<{ hsnCode: string; description: string; gstRate: number }> {
  const mappings: Record<string, string> = {
    "610910": "T-shirts and vests, knitted",
    "620520": "Men's shirts, cotton",
    "640351": "Footwear with leather soles",
    "847130": "Portable automatic data processing machines (laptops)",
    "851712": "Telephones for cellular networks (mobile phones)",
    "300490": "Medicaments",
    "190590": "Bread, biscuits, cakes",
    "852872": "Television receivers",
    "220210": "Waters, including mineral waters and aerated waters",
    "482010": "Registers, account books, notebooks",
  };
  
  const results: Array<{ hsnCode: string; description: string; gstRate: number }> = [];
  const search = searchTerm.toLowerCase();
  
  for (const [hsn, desc] of Object.entries(mappings)) {
    if (desc.toLowerCase().includes(search)) {
      results.push({ hsnCode: hsn, description: desc, gstRate: getGstRateForHsn(hsn) });
    }
  }
  
  return results.slice(0, 10);
}
