import Link from "next/link";
import { format } from "date-fns";

const sampleEntries = [
  {
    id: "2024-01-15",
    date: new Date("2024-01-15"),
    title: "Getting Started",
    excerpt: "First journal entry on my new website..."
  },
  {
    id: "2024-01-16",
    date: new Date("2024-01-16"),
    title: "Building the Website",
    excerpt: "Working on setting up the structure and pages..."
  }
];

export default function JournalPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Daily Journal</h1>
          <p className="text-gray-600 mt-2">
            My thoughts, experiences, and reflections
          </p>
        </header>

        <div className="space-y-4">
          {sampleEntries.map((entry) => (
            <Link
              key={entry.id}
              href={`/journal/${entry.id}`}
              className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 hover:border-gray-300"
            >
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                  {entry.title}
                </h2>
                <time className="text-sm text-gray-500">
                  {format(entry.date, "MMM d, yyyy")}
                </time>
              </div>
              <p className="text-gray-600">{entry.excerpt}</p>
            </Link>
          ))}
        </div>

        {sampleEntries.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No journal entries yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
