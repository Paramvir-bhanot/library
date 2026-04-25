import Link from "next/link";
import { notFound } from "next/navigation";
import knowledge from "@/src/app/data/knowlage.json";

function toSlug(value) {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/&/g, "and")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/(^-|-$)/g, "");
}

function getAllCourses() {
  return knowledge.departments.flatMap((department) =>
    department.courses.map((course) => ({
      ...course,
      department: department.name,
      departmentSlug: toSlug(department.name),
      slug: toSlug(course.course_name),
    }))
  );
}

function getAllDepartments() {
  return knowledge.departments.map((department) => ({
    ...department,
    slug: toSlug(department.name),
  }));
}

export async function generateStaticParams() {
  const departmentParams = getAllDepartments().map((department) => ({ id: department.slug }));
  const courseParams = getAllCourses().map((course) => ({ id: course.slug }));

  return [...departmentParams, ...courseParams];
}

export default async function CourseDetailsPage({ params }) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id || "").toLowerCase();

  const departments = getAllDepartments();
  const courses = getAllCourses();
  const department = departments.find((item) => item.slug === decodedId);
  const course = courses.find(
    (item) => item.slug === decodedId || item.course_name.toLowerCase() === decodedId
  );

  if (!course && !department) {
    notFound();
  }

  if (department) {
    return (
      <main className="min-h-screen bg-black px-4 py-10 text-white md:px-8 lg:px-12">
        <section className="mx-auto max-w-5xl">
          <nav className="mb-6 text-sm text-[#bfbfbf]">
            <Link href="/" className="hover:text-[#d4af37]">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/course" className="hover:text-[#d4af37]">
              Courses
            </Link>
            <span className="mx-2">/</span>
            <span className="text-[#d4af37]">{department.name}</span>
          </nav>

          <header className="rounded-2xl border border-[#2f2f2f] bg-gradient-to-br from-[#121212] to-[#080808] p-6 md:p-8">
            <p className="text-sm uppercase tracking-[0.2em] text-[#d4af37]">Department</p>
            <h1 className="mt-3 text-3xl font-bold md:text-5xl">{department.name}</h1>
            <p className="mt-4 max-w-3xl text-[#cccccc]">
              Programs offered by {knowledge.university} in {knowledge.mode} mode.
            </p>
          </header>

          <section className="mt-8 rounded-2xl border border-[#2f2f2f] bg-[#0f0f0f] p-6">
            <h2 className="text-2xl font-semibold text-white">Courses in {department.name}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {department.courses.map((item) => (
                <Link
                  key={item.course_name}
                  href={`/course/${toSlug(item.course_name)}`}
                  className="rounded-lg border border-[#323232] bg-black p-4 transition-colors hover:border-[#d4af37]"
                >
                  <p className="font-semibold text-white">{item.course_name}</p>
                  <p className="mt-1 text-sm text-[#c8c8c8]">{item.duration}</p>
                </Link>
              ))}
            </div>
          </section>
        </section>
      </main>
    );
  }

  const relatedCourses = courses
    .filter(
      (item) => item.department === course.department && item.course_name !== course.course_name
    )
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white md:px-8 lg:px-12">
      <section className="mx-auto max-w-5xl">
        <nav className="mb-6 text-sm text-[#bfbfbf]">
          <Link href="/" className="hover:text-[#d4af37]">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/course" className="hover:text-[#d4af37]">
            Courses
          </Link>
          <span className="mx-2">/</span>
          <Link href={`/course/${course.departmentSlug}`} className="hover:text-[#d4af37]">
            {course.department}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[#d4af37]">{course.course_name}</span>
        </nav>

        <header className="rounded-2xl border border-[#2f2f2f] bg-gradient-to-br from-[#121212] to-[#080808] p-6 md:p-8">
          <p className="text-sm uppercase tracking-[0.2em] text-[#d4af37]">Course</p>
          <h1 className="mt-3 text-3xl font-bold md:text-5xl">{course.course_name}</h1>
          <p className="mt-3 inline-flex rounded-md bg-[#151515] px-3 py-1 text-sm text-[#d4af37]">
            Duration: {course.duration}
          </p>
          <p className="mt-4 max-w-3xl text-[#cccccc]">{course.description}</p>
        </header>

        <section className="mt-8 rounded-2xl border border-[#2f2f2f] bg-[#0f0f0f] p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-white">Select a Subject</h2>
            <p className="text-sm text-[#bfbfbf]">Choose a subject to open matching PDF books</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {course.subjects.map((subject) => (
              <Link
                key={subject}
                href={`/course/${course.slug}/${toSlug(subject)}`}
                className="rounded-lg border border-[#323232] bg-black px-4 py-3 text-left text-[#e5e5e5] transition-colors hover:border-[#d4af37] hover:text-white"
              >
                {subject}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-[#2f2f2f] bg-[#0f0f0f] p-6">
          <h2 className="text-2xl font-semibold text-white">Related Courses</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {relatedCourses.length > 0 ? (
              relatedCourses.map((item) => (
                <Link
                  key={item.course_name}
                  href={`/course/${item.slug}`}
                  className="rounded-lg border border-[#323232] bg-black p-4 transition-colors hover:border-[#d4af37]"
                >
                  <p className="font-semibold text-white">{item.course_name}</p>
                  <p className="mt-1 text-sm text-[#c8c8c8]">{item.duration}</p>
                </Link>
              ))
            ) : (
              <p className="text-[#c8c8c8]">No other courses in this department.</p>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
