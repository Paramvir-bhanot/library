import Link from "next/link";
import knowledge from "@/src/app/data/knowlage.json";

function toSlug(value) {
  return value
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/&/g, "and")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default function CoursePage() {
  const { university, mode, departments } = knowledge;

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white md:px-8 lg:px-12">
      <section className="mx-auto max-w-7xl">
        <header className="mb-10 rounded-2xl border border-[#2f2f2f] bg-gradient-to-br from-[#111] to-[#090909] p-6 md:p-8">
          <p className="text-sm uppercase tracking-[0.25em] text-[#d4af37]">Course Directory</p>
          <h1 className="mt-3 text-3xl font-bold md:text-5xl">{university}</h1>
          <p className="mt-3 text-base text-[#bfbfbf] md:text-lg">Mode: {mode}</p>
        </header>

        <div className="space-y-8">
          {departments.map((department) => (
            <section
              key={department.name}
              className="rounded-2xl border border-[#2f2f2f] bg-[#0f0f0f] p-5 md:p-6"
            >
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-[#f8f8f8] md:text-2xl">{department.name}</h2>
                <p className="rounded-full border border-[#3a3a3a] px-3 py-1 text-sm text-[#d4af37]">
                  {department.courses.length} {department.courses.length === 1 ? "Course" : "Courses"}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {department.courses.map((course) => (
                  <Link
                    key={course.course_name}
                    href={`/course/${toSlug(course.course_name)}`}
                    className="group rounded-xl border border-[#2f2f2f] bg-black p-4 transition-colors hover:border-[#d4af37]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-semibold text-white group-hover:text-[#d4af37]">
                        {course.course_name}
                      </h3>
                      <span className="shrink-0 rounded-md bg-[#131313] px-2 py-1 text-xs text-[#d4af37]">
                        {course.duration}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {course.subjects.slice(0, 4).map((subject) => (
                        <span
                          key={subject}
                          className="rounded-full border border-[#353535] px-2 py-1 text-xs text-[#cfcfcf]"
                        >
                          {subject}
                        </span>
                      ))}
                      {course.subjects.length > 4 && (
                        <span className="rounded-full border border-[#353535] px-2 py-1 text-xs text-[#cfcfcf]">
                          +{course.subjects.length - 4} more
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}