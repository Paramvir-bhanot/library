import knowledge from "@/src/app/data/knowlage.json";

const departmentGroups = knowledge.departments.map((department) => {
  const categoryValues = [
    department.name,
    ...department.courses.map((course) => `${department.name} / ${course.course_name}`),
  ];

  return {
    department: department.name,
    categories: categoryValues,
  };
});

export const BOOK_CATEGORY_OPTIONS = departmentGroups;

export const ALLOWED_BOOK_CATEGORIES = departmentGroups.flatMap((group) => group.categories);

export function isValidBookCategory(value) {
  if (!value) {
    return true;
  }

  return ALLOWED_BOOK_CATEGORIES.includes(value.trim());
}
