// src/app/layout.js
"use client";
import { AuthProvider } from "@/contexts/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import dynamic from "next/dynamic";
import { useEffect } from "react";

// Import Bootstrap JS hanya di client-side (Dynamic Import)
dynamic(() => import("bootstrap/dist/js/bootstrap.bundle.min.js"), { ssr: false });

export default function RootLayout({ children }) {
  useEffect(() => {
    console.log("Bootstrap JS loaded dynamically on client-side");
  }, []);

  return (
    <html lang="en">
      <head>
        <title></title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
