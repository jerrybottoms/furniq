# 🪑 Furniture Finder App

Find similar furniture styles and shop the look. Take a photo of any furniture piece and discover matching products with prices and affiliate links.

## Features

- 📸 **Photo Capture** - Take a photo or select from gallery
- 🤖 **AI Analysis** - Detects furniture category, style, colors, and material
- 🔍 **Product Search** - Finds similar products from multiple sources
- 🛒 **Affiliate Shopping** - Direct links to purchase (Amazon, Wayfair, etc.)
- ❤️ **Favorites** - Save items for later (coming soon)

## Tech Stack

- **Frontend**: React Native (Expo)
- **Backend**: Supabase
- **AI**: OpenAI Vision API + Google Cloud Vision
- **Shopping APIs**: Amazon PA-API, Google Shopping API

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (or npm)
- Expo Go app (for iOS)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Fill in your `.env` file with API keys (see below)

5. Start the development server:
   ```bash
   pnpm start
   ```

6. Scan the QR code with Expo Go on your iOS device

## Environment Variables

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `EXPO_PUBLIC_OPENAI_API_KEY` | OpenAI API key (for Vision) |
| `EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY` | Google Cloud API key (optional) |
| `EXPO_PUBLIC_AMAZON_ASSOCIATE_TAG` | Amazon Associate tag |

## Project Structure

```
furniture-finder/
├── App.tsx                 # Main app entry with navigation
├── src/
│   ├── components/         # Reusable UI components
│   ├── screens/            # App screens
│   │   ├── HomeScreen.tsx  # Camera/upload interface
│   │   └── ResultsScreen.tsx # Product results
│   ├── services/           # API services
│   │   ├── supabase.ts     # Supabase client
│   │   ├── imageAnalysis.ts # AI image analysis
│   │   └── productSearch.ts # Product search
│   ├── types/              # TypeScript types
│   └── utils/              # Utility functions
├── assets/                 # Images, fonts, etc.
└── LOG.md                  # Development log
```

## API Setup

### OpenAI (Vision)

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an API key
3. Add to `.env` as `EXPO_PUBLIC_OPENAI_API_KEY`

### Supabase

1. Create project at [supabase.com](https://supabase.com)
2. Get URL and anon key from Settings → API
3. Add to `.env`

### Amazon Affiliate (optional)

1. Join Amazon Associates
2. Get your associate tag
3. Add to `.env`

## Development

### Running on iOS

```bash
pnpm ios
```

### Running on Android

```bash
pnpm android
```

### Running on Web

```bash
pnpm web
```

## Next Steps (MVP)

- [x] Photo capture & gallery selection
- [x] Image analysis with OpenAI Vision
- [x] Product search (mock)
- [x] Results display with affiliate links
- [ ] Real Amazon/Google Shopping API integration
- [ ] Favorites functionality
- [ ] User authentication
- [ ] TestFlight build

## License

MIT
