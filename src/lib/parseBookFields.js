export function parseBookFields(formData) {
  const parsed = {};
  const fields = [
    'title',
    'author',
    'description',
    'category',
    'bookClass',
    'subject',
    'price',
    'publishedDate',
    'pages',
    'language',
    'rating',
    'semester',
  ];

  fields.forEach((field) => {
    const value = formData.get(field);
    if (value === null || value === '') {
      return;
    }

    if (field === 'price' || field === 'pages' || field === 'rating' || field === 'semester') {
      parsed[field] = Number(value);
      return;
    }

    if (field === 'publishedDate') {
      parsed[field] = new Date(value);
      return;
    }

    parsed[field] = value;
  });

  return parsed;
}
