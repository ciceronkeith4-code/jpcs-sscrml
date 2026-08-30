import React from "react";
import { CurriculumViewPage } from "../../pages/student/CurriculumViewPage";
import type { User } from "../../types";

export default function CurriculumPage({ user }: { user?: User }) {
  return <CurriculumViewPage user={user} />;
}
export { CurriculumViewPage };
