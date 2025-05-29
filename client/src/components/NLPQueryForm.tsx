import React, { useState } from "react";

interface Recommendation {
  name: string;
  summary: string;
}

interface NLPQueryFormProps {
  // Change setResults to onSearch for clarity and future extensibility
  onSearch: (recommendations: Recommendation[], extractionArg?: { city?: string }) => void;
}

const NLPQueryForm: React.FC<NLPQueryFormProps> = ({ onSearch }) => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/nlp-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input })
      });
      if (!res.ok) throw new Error("Failed to get recommendations");
      const data = await res.json();
      onSearch(data.recommendations, data.extraction); // Pass extraction (city) to parent
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2 mb-6">
      <input
        className="border rounded px-3 py-2 text-black"
        type="text"
        placeholder="e.g. authentic Indian in Ottawa"
        value={input}
        onChange={e => setInput(e.target.value)}
        disabled={loading}
        required
      />
      <button
        className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
        type="submit"
        disabled={loading}
      >
        {loading ? "Searching..." : "Find Restaurants"}
      </button>
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
    </form>
  );
};

export default NLPQueryForm;
