"use client";

import { useState } from "react";
import SystemStatusPanel, {
  SystemStatusTrigger,
} from "@/components/SystemStatusPanel";

export default function SystemStatusPopover() {

  const [open, setOpen] = useState(false);

  console.log("[SystemStatusPopover] render, open =", open);

  return (
    <div className="relative">

      <SystemStatusTrigger
        open={open}
        onClick={() => {
          console.log("[SystemStatusPopover] tombol diklik, sebelumnya open =", open);
          setOpen((v) => !v);
        }}
      />

      {open && (
        <div
          role="dialog"
          aria-label="Status sistem"
          style={{
            position: "fixed",
            top: "80px",
            right: "16px",
            left: "16px",
            zIndex: 9999,
            background: "red",
            padding: "16px",
            maxWidth: "320px",
            marginLeft: "auto",
          }}
        >
          <p style={{ color: "white", fontWeight: "bold", marginBottom: "8px" }}>
            DEBUG: PANEL TERBUKA
          </p>
          <SystemStatusPanel compact />
        </div>
      )}

    </div>
  );

}
