
# Visitor Model & API Setup

This is a complete visitor management system for your Next.js app with name and email fields.

## File Structure

```
project/
├── app/
│   ├── api/
│   │   └── visitors/
│   │       └── route.js          # API endpoint (GET, POST, DELETE)
│   └── visitors/
│       └── page.js               # Visitors management page
├── components/
│   ├── VisitorForm.js            # Form component
│   └── VisitorsList.js           # List & delete component
├── lib/
│   └── models/
│       └── Visitor.js            # Model with business logic
└── data/
    └── visitors.json             # Auto-created data storage
```

## Setup Instructions

1. **Copy files to your project:**
   - `Visitor.js` → `lib/models/Visitor.js`
   - `route.js` → `app/api/visitors/route.js`
   - `VisitorForm.js` → `components/VisitorForm.js`
   - `VisitorsList.js` → `components/VisitorsList.js`
   - `page.js` → `app/visitors/page.js`

2. **No additional dependencies required!** Uses only built-in Next.js and React.

3. **Access your visitors page:**
   ```
   http://localhost:3000/visitors
   ```

## API Endpoints

### GET /api/visitors
Returns all visitors

```bash
curl http://localhost:3000/api/visitors
```

### POST /api/visitors
Create a new visitor

```bash
curl -X POST http://localhost:3000/api/visitors \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'
```

### DELETE /api/visitors
Delete a visitor by ID

```bash
curl -X DELETE "http://localhost:3000/api/visitors?id=1234567890"
```

## Features

✅ Add visitors with name & email
✅ Email validation
✅ View all visitors
✅ Delete visitors
✅ Local JSON file storage (no database needed)
✅ Beautiful Tailwind UI
✅ Error handling & loading states
✅ Timestamps for each visitor

## Data Storage

Data is stored in `data/visitors.json` (created automatically). Each visitor has:
- `id` - Unique timestamp-based ID
- `name` - Visitor name
- `email` - Visitor email
- `createdAt` - ISO timestamp

## Customization

### Change storage method
To use MongoDB, Prisma, or another database, simply replace the functions in `lib/models/Visitor.js`:
- `getVisitors()`
- `addVisitor(visitor)`
- `getVisitorById(id)`
- `deleteVisitor(id)`

### Add more fields
1. Update the form in `VisitorForm.js`
2. Update the list display in `VisitorsList.js`
3. Update validation in `Visitor.js`

### Style changes
All styles use Tailwind CSS classes - just edit the `className` attributes in the components.

## Notes

- Data persists in the `data/` folder
- The app creates the data directory automatically on first run
- Each visitor gets a unique ID based on timestamp
- Email format validation is included