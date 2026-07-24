import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_TEL } from "@/lib/contactDetails";
import { formatPhoneHe } from "@/lib/format";

export function LegalEmailLink() {
  return <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;
}

export function LegalPhoneLink() {
  return <a href={`tel:${CONTACT_PHONE_TEL}`}>{formatPhoneHe(CONTACT_PHONE)}</a>;
}
