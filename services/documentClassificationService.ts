import { extractTextFromPDF } from "@/utils/pdfUtils";
import { queryHuggingFace } from "@/utils/huggingfaceClient";

export async function classifyDocumentSections(fileUrl: string) {
  const text = await extractTextFromPDF(fileUrl);

  // Use a more comprehensive zero-shot classification model with expanded legal document types
  const result = await queryHuggingFace("facebook/bart-large-mnli", {
    inputs: text.slice(0, 2000), // Use first 2000 chars for faster classification
    parameters: {
      candidate_labels: [
        "Non-Disclosure Agreement",
        "Lease Agreement",
        "Employment Contract",
        "Service Agreement",
        "Partnership Agreement",
        "Purchase Agreement",
        "Licensing Agreement",
        "Terms of Service",
        "Privacy Policy",
        "Settlement Agreement",
        "Loan Agreement",
        "Franchise Agreement",
        "Consulting Agreement",
        "Master Service Agreement",
        "Supply Agreement",
      ],
    },
  });

  return result?.labels?.[0] || "Unknown Legal Document";
}
