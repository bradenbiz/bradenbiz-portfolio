import Link from "next/link";
import { format } from "date-fns";

const blogPosts = [
  {
    id: "the-spectrum-of-developers",
    date: new Date("2026-04-02"),
    title: "The Spectrum of Developers: Builders vs. Coders in the Age of AI",
    excerpt:
      "There is a spectrum of people who, depending on how much they like coding versus how much they like building things, are experiencing the AI revolution very differently.",
  },
  {
    id: "things-i-will-not-do",
    date: new Date("2024-01-15"),
    title: "Things I Will Not Do",
    excerpt:
      "A list of commitments and boundaries I've set for myself to stay focused on what's important.",
  },
  {
    id: "building-the-website",
    date: new Date("2024-01-16"),
    title: "Building the Website",
    excerpt: "Working on setting up the structure and pages...",
  },
  {
    id: "getting-started",
    date: new Date("2024-01-15"),
    title: "Getting Started",
    excerpt: "First blog entry on my new website...",
  },
];

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Blog</h1>
          <p className="text-gray-600 mt-2">
            My thoughts, experiences, and reflections
          </p>
        </header>

        <div className="space-y-4">
          {blogPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.id}`}
              className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 hover:border-gray-300"
            >
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                  {post.title}
                </h2>
                <time className="text-sm text-gray-500 whitespace-nowrap ml-4">
                  {format(post.date, "MMM d, yyyy")}
                </time>
              </div>
              <p className="text-gray-600">{post.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
