
import { GoogleGenAI } from "@google/genai";
import type { Invoice, TemplateId } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const templateStyles: Record<TemplateId, string> = {
    classic: 'A classic, professional design. Recommended font: a serif font like Times New Roman. The layout should be traditional and formal, with clear sections and borders on the item table.',
    modern: 'A modern, clean design. Recommended font: a sans-serif font like Inter or Helvetica. Emphasize whitespace and use a single accent color (e.g., bg-indigo-600 for headers, bg-indigo-50 for total) for key elements. Avoid heavy borders; use subtle dividers.',
    minimalist: 'A minimalist, typography-focused design. Recommended font: a monospaced font like Courier or Source Code Pro. Use minimal styling, focusing on clean alignment and structure. No background colors or heavy decoration. Use only text weight and spacing for emphasis.'
};


export async function generateInvoiceHtml(invoiceData: Invoice, templateId: TemplateId): Promise<string> {
    const styleDescription = templateStyles[templateId];

    const logoInstruction = invoiceData.sender.logo
    ? `
**Logo Integration:**
- The sender has provided a logo. You MUST place this logo in the header of the invoice.
- Use an \`<img>\` tag to embed the logo. Apply appropriate Tailwind CSS classes for sizing and alignment, for example: \`<img src="${invoiceData.sender.logo}" alt="${invoiceData.sender.name} Logo" class="h-16 w-auto">\`
- The logo should typically be on the left, and the "TAX INVOICE" title on the right, or the logo can be centered above the sender's details. Ensure the layout is balanced and professional.
- If you place the logo, you can de-emphasize the sender's name text, as the logo now provides the primary branding.
`
    : `
**Logo Integration:**
- No logo has been provided.
- You MUST display the sender's name, \`${invoiceData.sender.name}\`, as a prominent heading (e.g., using a larger font size or bold weight) at the top of the invoice.
`;
    
    const prompt = `
You are an expert Indian GST invoice generator. Your task is to take a JSON object containing invoice data and convert it into a clean, professional, and well-structured HTML document that is compliant with Indian GST laws.

You MUST use Tailwind CSS classes for all styling. Do not use any inline styles.

${logoInstruction}

**Design Requirement:** You must adhere strictly to the following design template:
- **Template Name:** ${templateId}
- **Style Guide:** ${styleDescription}

**GST Compliance Requirements:**
1.  **GSTIN:** Display the sender's and recipient's GSTIN clearly under their respective details. Label it "GSTIN:".
2.  **Place of Supply:** Display the "Place of Supply" prominently, usually near the invoice date details.
3.  **HSN/SAC Code:** The items table MUST include a column for "HSN/SAC Code".
4.  **Tax Calculation:**
    - Calculate the Subtotal (total of all item amounts before tax).
    - If 'cgstRate' and 'sgstRate' in the JSON are greater than 0, calculate and display CGST and SGST amounts separately.
    - If 'igstRate' in the JSON is greater than 0, calculate and display the IGST amount.
    - The final "Total Amount" should be Subtotal + all applicable taxes.
    - The tax breakdown (Subtotal, CGST, SGST, IGST, Total) should be clearly displayed on the right side below the items table.
5.  **Reverse Charge:** If the 'reverseCharge' flag is true, you MUST include a note on the invoice, such as "GST payable on reverse charge basis".

Here is the JSON data:
\`\`\`json
${JSON.stringify(invoiceData, null, 2)}
\`\`\`

Please generate the complete HTML for the invoice. It should include:
1.  A clean header with the title "TAX INVOICE".
2.  The sender's details (Name, Address, Phone, Email, GSTIN).
3.  The recipient's details (Name, Address, Phone, Email, GSTIN).
4.  Invoice number, invoice date, due date, and Place of Supply.
5.  A table for the line items with columns: "Item Description", "HSN/SAC Code", "Qty", "Rate", and "Amount".
6.  The tax calculation breakdown (Subtotal, CGST, SGST, IGST, Total Amount) as described above.
7.  The "Notes" and "Terms & Conditions" sections.
8.  The Reverse Charge notice if applicable.
9.  The final output must be a single block of self-contained HTML code that can be rendered directly. Do not include \`<html>\`, \`<head>\`, or \`<body>\` tags. Do not wrap the output in markdown backticks.
`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const text = response.text;
        
        // Clean up potential markdown formatting from the response
        const cleanedHtml = text.replace(/^```html\n|```$/g, '').trim();

        return cleanedHtml;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to generate invoice HTML from Gemini API.");
    }
}