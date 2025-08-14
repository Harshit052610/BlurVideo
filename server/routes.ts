import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { z } from "zod";
import { processQuestionSchema } from "@shared/schema";
import { generateSolutions, validateApiKey } from "./services/gemini";
import { extractTextFromImage, validateImageFile } from "./services/ocr";
import { extractTextFromPDF, validatePDFFile } from "./services/pdfParser";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", async (req, res) => {
    try {
      const apiKeyValid = await validateApiKey();
      res.json({ 
        status: "ok", 
        geminiApiConnected: apiKeyValid,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Service health check failed",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Process text questions directly
  app.post("/api/process-text", async (req, res) => {
    try {
      const { text, filename } = processQuestionSchema.parse(req.body);
      
      const solutions = await generateSolutions(text);
      
      res.json({
        success: true,
        extractedText: text,
        solutions,
        filename: filename || "Manual Input",
        processedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Text processing error:", error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Invalid input data",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: error instanceof Error ? error.message : "Failed to process text"
        });
      }
    }
  });

  // Process uploaded files
  app.post("/api/process-file", upload.single("file"), async (req, res) => {
    try {
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      let extractedText: string;

      // Handle different file types
      if (file.mimetype === 'application/pdf') {
        validatePDFFile(file);
        extractedText = await extractTextFromPDF(file.buffer);
      } else if (file.mimetype.startsWith('image/')) {
        validateImageFile(file);
        extractedText = await extractTextFromImage(file.buffer);
      } else if (file.mimetype === 'text/plain') {
        extractedText = file.buffer.toString('utf-8');
      } else {
        return res.status(400).json({
          message: "Unsupported file type. Please upload PDF, PNG, JPG, or TXT files."
        });
      }

      if (!extractedText.trim()) {
        return res.status(400).json({
          message: "No text could be extracted from the uploaded file"
        });
      }

      // Generate solutions using Gemini AI
      const solutions = await generateSolutions(extractedText);

      res.json({
        success: true,
        filename: file.originalname,
        fileType: file.mimetype,
        extractedText,
        solutions,
        processedAt: new Date().toISOString()
      });

    } catch (error) {
      console.error("File processing error:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to process file"
      });
    }
  });

  // Get processing status (for future WebSocket implementation)
  app.get("/api/status/:jobId", (req, res) => {
    // Placeholder for future job tracking implementation
    res.json({
      jobId: req.params.jobId,
      status: "completed",
      progress: 100
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
