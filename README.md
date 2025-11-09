# AI Coloring Book Generator

A Next.js application that creates custom coloring pages using AI. Users describe what they want, and the app generates unique black and white coloring pages using ChatGPT and DALL-E.

![Built with Next.js](https://img.shields.io/badge/Next.js-14.0.4-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3.0-38B2AC)

## Features

- **AI-Powered Generation**: Uses ChatGPT to enhance user prompts and DALL-E to create images
- **User-Friendly Interface**: Clean, responsive design with dark mode support
- **Instant Download**: Download generated coloring pages in high quality
- **Print Ready**: Black and white line art perfect for coloring

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: OpenAI API (ChatGPT & DALL-E)
- **Deployment**: Vercel-ready

## Prerequisites

- Node.js 18+ installed
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd coloring-book-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:
   ```bash
   cp .env.example .env.local
   ```

   Then add your OpenAI API key to `.env.local`:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## Usage

### Development Server

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

Build for production:

```bash
npm run build
npm start
```

## How It Works

1. **User Input**: User describes their desired coloring page (e.g., "a friendly dragon flying over a castle")
2. **AI Enhancement**: ChatGPT optimizes the description for coloring book generation
3. **Image Generation**: DALL-E creates a black and white line drawing
4. **Download**: User can view and download the coloring page

## Project Structure

```
coloring-book-ai/
├── src/
│   └── app/
│       ├── api/
│       │   └── generate/
│       │       └── route.ts          # API endpoint for AI generation
│       ├── components/
│       │   └── ColoringBookForm.tsx  # Main form component
│       ├── layout.tsx                # Root layout
│       ├── page.tsx                  # Homepage
│       └── globals.css               # Global styles
├── public/                           # Static assets
├── .env.example                      # Environment variables template
└── package.json
```

## API Routes

### POST `/api/generate`

Generates a coloring page based on user description.

**Request Body:**
```json
{
  "description": "a cute unicorn in a magical forest"
}
```

**Response:**
```json
{
  "success": true,
  "imageUrl": "https://...",
  "enhancedPrompt": "...",
  "originalDescription": "a cute unicorn in a magical forest"
}
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |

## Future Enhancements

- [ ] User authentication and accounts
- [ ] Cloud storage for generated coloring pages
- [ ] Create and manage digital coloring books
- [ ] Drag-and-drop page organization
- [ ] Share coloring pages with others
- [ ] Multiple AI model options
- [ ] Batch generation

## Development

### Linting

```bash
npm run lint
```

### Type Checking

TypeScript strict mode is enabled for better type safety.

## Deployment

### Deploy to Vercel

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add your `OPENAI_API_KEY` environment variable
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

**Important**: Don't forget to add your environment variables in the Vercel project settings.

## Cost Considerations

This app uses OpenAI's paid APIs:
- **GPT-4**: ~$0.03 per 1K tokens (prompt enhancement)
- **DALL-E 3**: ~$0.04-0.08 per image (standard quality 1024x1024)

Each generation costs approximately $0.05-0.10 depending on prompt complexity.

## Troubleshooting

### "OpenAI API key is not configured"
Make sure you've created a `.env.local` file with your API key.

### Build fails with font errors
The app uses system fonts, so this shouldn't happen. If it does, check your internet connection.

### "Rate limit exceeded"
You've hit OpenAI's rate limits. Wait a moment and try again, or upgrade your OpenAI plan.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub.
