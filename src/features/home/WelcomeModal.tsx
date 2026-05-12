"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Modal } from "@/components/Modal";
import styles from "./WelcomeModal.module.scss";

const STORAGE_KEY = "welcomeModalSeen";
const DELAY_MS = 2500;

export function WelcomeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    const timer = setTimeout(() => setOpen(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  function handleClose() {
    setOpen(false);
    sessionStorage.setItem(STORAGE_KEY, "1");
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <div className={styles.body}>
        <h2 className={styles.heading}>לא מצאתם את הבושם שאתם מחפשים?</h2>
        <p className={styles.text}>
          פנו אלינו עם שם הבושם, ונעשה את מירב המאמצים להשיג אותו עבורכם.
        </p>
        <Link href="/contact" className={styles.cta} onClick={handleClose}>
          צרו קשר
        </Link>
      </div>
    </Modal>
  );
}
