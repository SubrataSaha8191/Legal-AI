import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';

// Disable default body parser (for file uploads)
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Create temporary uploads folder in /tmp
  const uploadDir = path.join('/tmp', 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const form = formidable({ multiples: false, uploadDir });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error parsing the file' });
    }

    const file = files.pdf;
    if (!file) return res.status(400).json({ error: 'No PDF uploaded' });

    try {
      const dataBuffer = fs.readFileSync(file.filepath);
      const pdfData = await pdfParse(dataBuffer);

      // Optional: delete file after processing
      fs.unlinkSync(file.filepath);

      return res.status(200).json({
        text: pdfData.text,
        message: 'PDF analyzed successfully',
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error reading PDF' });
    }
  });
}
