'use client';

import { useState } from 'react';
import Image from 'next/image';

interface GenerationResponse {
  success: boolean;
  imageUrl: string;
  enhancedPrompt: string;
  originalDescription: string;
  error?: string;
}

export default function ColoringBookForm() {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: description.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate coloring page');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setDescription('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium mb-2"
          >
            Describe your coloring book page
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., A friendly dragon flying over a castle, A cute unicorn in a magical forest, A race car speeding around a track..."
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
            disabled={loading}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !description.trim()}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating...
              </span>
            ) : (
              'Generate Coloring Page'
            )}
          </button>

          {result && (
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              New Page
            </button>
          )}
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mt-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200 font-medium">
            Error: {error}
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mt-8 p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <div className="text-center">
            <div className="inline-block animate-pulse">
              <svg
                className="w-16 h-16 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Creating your coloring page...
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
              This may take 15-30 seconds
            </p>
          </div>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="mt-8 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            {/* Image */}
            <div className="relative aspect-square bg-gray-100 dark:bg-gray-900">
              <Image
                src={result.imageUrl}
                alt={result.originalDescription}
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Details */}
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Your Description:
                </h3>
                <p className="mt-1 text-gray-900 dark:text-gray-100">
                  {result.originalDescription}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  AI-Enhanced Prompt:
                </h3>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                  {result.enhancedPrompt}
                </p>
              </div>

              {/* Download Button */}
              <a
                href={result.imageUrl}
                download="coloring-page.png"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium text-center rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Download Coloring Page
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
