"use client";

import { getMyMiningLink } from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Button, Card, Form, InputGroup } from "react-bootstrap";

export default function MyMiningLinkTab() {
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);

  const fetchLink = async () => {
    try {
      const res = await getMyMiningLink();
      setLink(res.fullLink);
    } catch (err) {
      console.error("❌ Gagal memuat link mining:", err);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    fetchLink();
  }, []);

  return (
    <Card bg="dark" text="white" className="p-4">
      <h5 className="mb-3">Link Referral Mining Kamu</h5>
      {link ? (
        <>
          <InputGroup className="mb-2">
            <Form.Control value={link} readOnly />
            <Button onClick={handleCopy}>
              {copied ? "Tersalin!" : "Salin"}
            </Button>
          </InputGroup>
          <small>Bagikan link ini ke temanmu. Klik yang valid akan dihitung sebagai reward!</small>
        </>
      ) : (
        <p>Memuat link...</p>
      )}
    </Card>
  );
}
