import { FileGrid } from "@/components/file-grid";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FileGrid />
    </Suspense>
  );
}
