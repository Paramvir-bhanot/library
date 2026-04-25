import Link from "next/link";
import { notFound } from "next/navigation";
import knowledge from "@/src/app/data/knowlage.json";
import connectDB from "@/src/lib/DBconnection";
import Book from "@/src/models/books";

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

function normalize(value) {
	return (value || "").toString().trim().toLowerCase();
}

async function getRelatedBooks(course, subjectName) {
	await connectDB();

	const books = await Book.find({}).lean();
	const subject = normalize(subjectName);
	const departmentCategory = normalize(course.department);
	const courseCategory = normalize(`${course.department} / ${course.course_name}`);
	const courseClass = normalize(course.course_name);

	const matches = books.filter((book) => {
		const bookSubject = normalize(book.subject);
		const bookTitle = normalize(book.title);
		const bookCategory = normalize(book.category);
		const bookClass = normalize(book.bookClass);

		const subjectMatch =
			bookSubject === subject ||
			bookSubject.includes(subject) ||
			subject.includes(bookSubject) ||
			bookTitle === subject ||
			bookTitle.includes(subject) ||
			subject.includes(bookTitle);

		if (!subjectMatch) {
			return false;
		}

		const courseMatch =
			bookClass === courseClass ||
			bookCategory === departmentCategory ||
			bookCategory === courseCategory ||
			bookCategory.includes(courseClass) ||
			bookCategory.includes(departmentCategory) ||
			bookTitle.includes(courseClass);

		return courseMatch || !bookClass;
	});

	const fallback = books.filter((book) => normalize(book.subject) === subject);
	return [...matches, ...fallback].filter(
		(book, index, array) => array.findIndex((item) => String(item._id) === String(book._id)) === index
	);
}

export default async function SubjectPage({ params }) {
	const { id, subjects } = await params;
	const courseSlug = decodeURIComponent(id || "").toLowerCase();
	const subjectSlug = decodeURIComponent(subjects || "").toLowerCase();

	const course = getAllCourses().find((item) => item.slug === courseSlug);
	if (!course) {
		notFound();
	}

	const subjectName = course.subjects.find((subject) => toSlug(subject) === subjectSlug);
	if (!subjectName) {
		notFound();
	}

	const relatedBooks = await getRelatedBooks(course, subjectName);

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
					<Link href={`/course/${course.slug}`} className="hover:text-[#d4af37]">
						{course.course_name}
					</Link>
					<span className="mx-2">/</span>
					<span className="text-[#d4af37]">{subjectName}</span>
				</nav>

				<header className="rounded-2xl border border-[#2f2f2f] bg-gradient-to-br from-[#121212] to-[#080808] p-6 md:p-8">
					<p className="text-sm uppercase tracking-[0.2em] text-[#d4af37]">Subject</p>
					<h1 className="mt-3 text-3xl font-bold md:text-5xl">{subjectName}</h1>
					<p className="mt-3 text-base text-[#cfcfcf] md:text-lg">
						{course.course_name} - {course.department}
					</p>
					<p className="mt-4 max-w-3xl text-[#cccccc]">
						Matching PDF books related to this subject are listed below.
					</p>
				</header>

				<section className="mt-8 rounded-2xl border border-[#2f2f2f] bg-[#0f0f0f] p-6">
					<div className="mb-4 flex items-center justify-between gap-3">
						<h2 className="text-2xl font-semibold text-white">Related PDF Books</h2>
						<Link href={`/course/${course.slug}`} className="text-sm text-[#d4af37] hover:underline">
							Back to course
						</Link>
					</div>

					{relatedBooks.length > 0 ? (
						<div className="grid gap-4 sm:grid-cols-2">
							{relatedBooks.map((book) => (
									book.pdfUrl ? (
									<a
									key={book._id}
									href={book.pdfUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="rounded-xl border border-[#323232] bg-black p-4 transition-colors hover:border-[#d4af37]"
								>
									<div className="flex items-start justify-between gap-3">
										<div>
											<p className="text-lg font-semibold text-white">{book.title}</p>
											<p className="mt-1 text-sm text-[#c8c8c8]">{book.author}</p>
										</div>
										<span className="rounded-md bg-[#131313] px-2 py-1 text-xs text-[#d4af37]">
											PDF
										</span>
									</div>

									{book.description && (
										<p className="mt-3 line-clamp-3 text-sm leading-6 text-[#bcbcbc]">
											{book.description}
										</p>
									)}

									<div className="mt-4 flex flex-wrap gap-2 text-xs text-[#bfbfbf]">
										{book.bookClass && (
											<span className="rounded-full border border-[#2f2f2f] px-2 py-1">
												{book.bookClass}
											</span>
										)}
										{book.category && (
											<span className="rounded-full border border-[#2f2f2f] px-2 py-1">
												{book.category}
											</span>
										)}
										{!book.pdfUrl && (
											<span className="rounded-full border border-[#5a3d00] px-2 py-1 text-[#ffcb6b]">
												PDF not uploaded
											</span>
										)}
									</div>
								</a>
							) : (
								<div
									key={book._id}
									className="rounded-xl border border-[#323232] bg-black p-4"
								>
									<div className="flex items-start justify-between gap-3">
										<div>
											<p className="text-lg font-semibold text-white">{book.title}</p>
											<p className="mt-1 text-sm text-[#c8c8c8]">{book.author}</p>
										</div>
										<span className="rounded-md bg-[#131313] px-2 py-1 text-xs text-[#d4af37]">
											Book
										</span>
									</div>

									{book.description && (
										<p className="mt-3 line-clamp-3 text-sm leading-6 text-[#bcbcbc]">
											{book.description}
										</p>
									)}

									<div className="mt-4 flex flex-wrap gap-2 text-xs text-[#bfbfbf]">
										{book.bookClass && (
											<span className="rounded-full border border-[#2f2f2f] px-2 py-1">
												{book.bookClass}
											</span>
										)}
										{book.category && (
											<span className="rounded-full border border-[#2f2f2f] px-2 py-1">
												{book.category}
											</span>
										)}
										<span className="rounded-full border border-[#5a3d00] px-2 py-1 text-[#ffcb6b]">
											PDF not uploaded
										</span>
									</div>
								</div>
							)
							))}
						</div>
					) : (
						<div className="rounded-xl border border-dashed border-[#333333] bg-black/40 p-8 text-center">
							<h3 className="text-xl font-semibold text-white">No related PDF books yet</h3>
							<p className="mt-2 text-[#bfbfbf]">
								Upload a PDF book with this subject in the admin panel to make it appear here.
							</p>
						</div>
					)}
				</section>
			</section>
		</main>
	);
}
