import { Spinner } from "@/components/Spinner";

export default function Loading() {
  return (
    <div style={{ padding: "120px 16px" }}>
      <Spinner size={40} label="טוען מוצר" />
    </div>
  );
}
