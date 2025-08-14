import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  selectedFile: File | null;
  isProcessing: boolean;
}

export function FileUpload({ onFileSelect, onFileRemove, selectedFile, isProcessing }: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
    setDragOver(false);
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter: () => setDragOver(true),
    onDragLeave: () => setDragOver(false),
    accept: {
      'application/pdf': ['.pdf'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'text/plain': ['.txt']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    disabled: isProcessing
  });

  if (selectedFile) {
    return (
      <div className="glassmorphism rounded-2xl p-8" data-testid="file-selected-display">
        <div className="space-y-6">
          <div className="w-20 h-20 glassmorphism-dark rounded-2xl flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-green-300" data-testid="file-selected-icon" />
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-semibold mb-2" data-testid="file-selected-title">File Selected</h3>
            <p className="text-gray-200 mb-2" data-testid="file-selected-name">{selectedFile.name}</p>
            <p className="text-sm text-gray-300" data-testid="file-selected-size">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
          <button
            onClick={onFileRemove}
            disabled={isProcessing}
            className="glassmorphism-dark hover:bg-white hover:bg-opacity-30 px-6 py-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="button-change-file"
          >
            <X className="w-4 h-4 inline mr-2" />
            Change File
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed border-white border-opacity-40 rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer",
        "hover:border-opacity-60",
        (isDragActive || dragOver) && "drag-over",
        isProcessing && "opacity-50 cursor-not-allowed"
      )}
      data-testid="file-upload-area"
    >
      <input {...getInputProps()} data-testid="file-input" />
      <div className="space-y-6">
        <div className="w-20 h-20 glassmorphism-dark rounded-2xl flex items-center justify-center mx-auto animate-pulse-soft">
          <Upload className="w-8 h-8" data-testid="upload-icon" />
        </div>
        <div>
          <h3 className="text-2xl font-semibold mb-2" data-testid="upload-title">Upload Your Question Paper</h3>
          <p className="text-gray-200 mb-4" data-testid="upload-description">
            {isDragActive ? "Drop the file here..." : "Drag and drop or click to browse"}
          </p>
          <p className="text-sm text-gray-300" data-testid="upload-file-types">
            Supports PDF, PNG, JPG, and text files (Max 10MB)
          </p>
        </div>
        <button
          type="button"
          className="glassmorphism-dark hover:bg-white hover:bg-opacity-30 px-8 py-3 rounded-xl transition-all duration-300"
          data-testid="button-choose-file"
        >
          <File className="w-4 h-4 inline mr-2" />
          Choose File
        </button>
      </div>
    </div>
  );
}
