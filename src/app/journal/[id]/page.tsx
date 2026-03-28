import { format } from "date-fns";
import Link from "next/link";
import { notFound } from "next/navigation";

const sampleEntries = [
  {
    id: "2024-01-15",
    date: new Date("2024-01-15"),
    title: "Getting Started",
    content: `
      <h2>First Journal Entry</h2>
      <p>This is my first journal entry on my new website. I'm excited to start documenting my thoughts and experiences here.</p>
      <p>Today I worked on setting up this website with Next.js, TypeScript, and Tailwind CSS. It's been a great learning experience.</p>
      <h3>What I learned:</h3>
      <ul>
        <li>Next.js App Router is powerful</li>
        <li>TypeScript makes development much more reliable</li>
        <li>Tailwind CSS is incredibly fast for styling</li>
      </ul>
    `,
  },
  {
    id: "2024-01-16",
    date: new Date("2024-01-16"),
    title: "Building the Website",
    content: `
      <h2>Building the Website</h2>
      <p>Continued working on the website structure today. I'm planning to add more features like:</p>
      <ul>
        <li>Markdown support for journal entries</li>
        <li>Image uploads</li>
        <li>API integrations</li>
        <li>Search functionality</li>
      </ul>
      <p>I'm also thinking about adding a <a href="/things-i-will-not-do" class="text-blue-600 hover:underline">Things I Will Not Do</a> page to track my commitments.</p>
    `,
  },
];

interface JournalEntryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function JournalEntryPage({ params }: JournalEntryPageProps) {
  const { id } = await params;
  const entry = sampleEntries.find((e) => e.id === id);

  if (!entry) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="mb-4">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {entry.title}
            </h1>
            <time className="text-lg text-gray-500">
              {format(entry.date, "EEEE, MMMM d, yyyy")}
            </time>
          </div>
        </header>

        <article className="prose prose-lg max-w-none bg-white p-8 rounded-lg shadow-md border border-gray-200">
          <div
            dangerouslySetInnerHTML={{ __html: entry.content }}
            className="prose-headings:text-gray-900 prose-p:text-gray-700 prose-ul:text-gray-700 prose-li:text-gray-700"
          />
        </article>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link
            href="/journal"
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            &larr; Back to all entries
          </Link>
        </div>
      </div>
    </div>
  );
}
