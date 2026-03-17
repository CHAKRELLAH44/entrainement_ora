import { Suspense } from "react";
import ExpressionSessionContent from "./content";

export default function ExpressionSessionPage() {
  return (
    <Suspense fallback={<div className="page-wrapper"><div className="card">Chargement...</div></div>}>
      <ExpressionSessionContent />
    </Suspense>
  );
}
