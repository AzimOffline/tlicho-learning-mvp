import { lessons, units } from "@/db/schema";

import { LessonButton } from "./lesson-button";
import { CollapsibleUnit } from "@/components/collapsible-unit";

type UnitProps = {
  id: number;
  order: number;
  title: string;
  description: string;
  lessons: (typeof lessons.$inferSelect & {
    completed: boolean;
  })[];
  activeLesson:
    | (typeof lessons.$inferSelect & {
        unit: typeof units.$inferSelect;
      })
    | undefined;
  activeLessonPercentage: number;
  heartsDepleted: boolean;
};

export const Unit = ({
  order,
  title,
  description,
  lessons,
  activeLesson,
  activeLessonPercentage,
  heartsDepleted,
}: UnitProps) => {
  return (
    <CollapsibleUnit
      title={title}
      description={description}
      number={order}
      completed={lessons.filter((lesson) => lesson.completed).length}
      total={lessons.length}
      current={lessons.some((lesson) => lesson.id === activeLesson?.id)}
    >
      <div className="relative flex flex-col items-center">
        {lessons.map((lesson, i) => {
          const isCurrent = lesson.id === activeLesson?.id;
          const isLocked = heartsDepleted || (!lesson.completed && !isCurrent);

          return (
            <LessonButton
              key={lesson.id}
              id={lesson.id}
              index={i}
              totalCount={lessons.length - 1}
              current={isCurrent}
              locked={isLocked}
              percentage={activeLessonPercentage}
            />
          );
        })}
      </div>
    </CollapsibleUnit>
  );
};
