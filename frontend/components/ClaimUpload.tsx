"use client";

import { useState } from 'react';

export default function ClaimUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    // Simulate upload and parsing
    setTimeout(() => {
      setIsUploading(false);
      setUploadSuccess(true);
    }, 2000);
  };

  return (
    <div className="p-8 bg-card rounded-xl border border-border shadow-sm max-w-xl mx-auto">
      <h3 className="text-xl font-bold mb-2">Upload Claims Export</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Securely upload your CSV or EDI 835/837 files. ClaimLift normalizes the data and flags recovery opportunities autonomously.
      </p>

      {!uploadSuccess ? (
        <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:bg-muted/50 transition cursor-pointer relative">
          <input 
            type="file" 
            accept=".csv,.txt,.835,.837"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          {isUploading ? (
            <div className="text-primary font-medium animate-pulse">Uploading and Parsing...</div>
          ) : (
            <div>
              <div className="text-4xl mb-4">📄</div>
              <p className="font-medium">Drag & Drop or Click to Browse</p>
              <p className="text-xs text-muted-foreground mt-2">Supports CSV, 835, and 837 formats</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center p-8 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
          <div className="text-4xl mb-4">✅</div>
          <h4 className="font-bold text-green-700 dark:text-green-400 mb-2">Upload Complete!</h4>
          <p className="text-sm text-green-600 dark:text-green-500">
            The Claim Intelligence Agent is currently processing 1,432 claims. Your dashboard will update shortly.
          </p>
          <button 
            onClick={() => setUploadSuccess(false)}
            className="mt-6 text-sm font-medium text-primary hover:underline"
          >
            Upload Another File
          </button>
        </div>
      )}
    </div>
  );
}
