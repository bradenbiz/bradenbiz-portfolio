const sampleItems = [
  {
    id: 1,
    title: "Check work email after 6 PM",
    description: "I will not check or respond to work emails after 6 PM to maintain work-life balance.",
    category: "Work",
    dateAdded: "2024-01-15"
  },
  {
    id: 2,
    title: "Buy things on impulse",
    description: "I will not make purchases without waiting 24 hours to think about whether I really need it.",
    category: "Personal Finance",
    dateAdded: "2024-01-15"
  },
  {
    id: 3,
    title: "Skip morning exercise",
    description: "I will not skip my morning workout routine, even when I'm busy or tired.",
    category: "Health",
    dateAdded: "2024-01-16"
  }
];

export default function ThingsIWillNotDoPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Things I Will Not Do</h1>
          <p className="text-gray-600 mt-2">
            A list of commitments and boundaries I&apos;ve set for myself
          </p>
        </header>

        <div className="space-y-6">
          {sampleItems.map((item) => (
            <div
              key={item.id}
              className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
            >
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-xl font-semibold text-gray-900">{item.title}</h2>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  {item.category}
                </span>
              </div>
              <p className="text-gray-700 mb-3">{item.description}</p>
              <div className="text-sm text-gray-500">
                Added: {item.dateAdded}
              </div>
            </div>
          ))}
        </div>

        {sampleItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No items added yet.</p>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-gray-600 text-center">
            This list helps me stay focused on what&apos;s important and avoid common pitfalls.
          </p>
        </div>
      </div>
    </div>
  );
}
