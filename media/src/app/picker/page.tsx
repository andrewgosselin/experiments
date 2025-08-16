"use client";

import { FileGrid } from "@/components/file-grid";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

// This would typically come from your environment variables
const ALLOWED_ORIGINS = process.env.NEXT_PUBLIC_ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];

export default function PickerPage() {
  const searchParams = useSearchParams();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Get the allowed file types from search params
  const allowedTypes = searchParams.get('type')?.split(',') || [];
  const token = searchParams.get('token');

  useEffect(() => {
    // Validate token and origin
    const validateAccess = async () => {
      try {
        // Check if we're in an iframe
        if (window.self === window.top) {
          console.error('Picker must be used in an iframe');
          return;
        }

        // Validate token
        if (!token) {
          console.error('No token provided');
          return;
        }

        // Validate token with your backend
        const response = await fetch('/api/validate-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          console.error('Invalid token');
          return;
        }

        const { origin } = await response.json();

        // Validate origin
        if (!ALLOWED_ORIGINS.includes(origin)) {
          console.error('Unauthorized origin');
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Validation failed:', error);
      }
    };

    validateAccess();
  }, [token]);

  const handleSelect = (fileId: string) => {
    if (!isAuthorized) return;
    setSelectedFile(fileId);
  };

  const handleConfirm = () => {
    if (!isAuthorized || !selectedFile) return;

    console.info("Selected file:", selectedFile);
    // Send message to parent window
    window.parent.postMessage({
      type: 'ASSET_SELECTED',
      payload: {
        fileId: selectedFile,
        token, // Include token in response for verification
        timestamp: new Date().toISOString()
      }
    }, '*'); // In production, you should use the validated origin instead of '*'

    console.info("Closing picker");
    // Close the picker
    window.parent.postMessage({
      type: 'PICKER_CLOSE'
    }, '*');
  };

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Unauthorized Access</h2>
          <p className="text-muted-foreground">This picker can only be used in authorized applications.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <FileGrid 
          mode="picker" 
          onSelect={handleSelect}
          selectedFileId={selectedFile}
          allowedTypes={allowedTypes}
        />
      </div>
      <div className="border-t p-4 flex justify-end gap-2">
        <Button variant="outline" onClick={() => {
          window.parent.postMessage({
            type: 'PICKER_CANCEL'
          }, '*');
        }}>
          Cancel
        </Button>
        <Button 
          onClick={handleConfirm}
          disabled={!selectedFile}
        >
          Select Asset
        </Button>
      </div>
    </div>
  );
} 