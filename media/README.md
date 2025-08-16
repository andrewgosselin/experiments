# ✨ Asset Manager

** This project is still in progress and not production ready **

A modern, zero-dependency asset management system built with Next.js. Store, process, and serve your media assets with automatic optimization and variant generation. Supports multiple storage backends including local filesystem, S3, GCS, and more. **Completely self-hostable, database-free, and lightning fast!** Easily integrate into any CMS via an existing official extension or by making your own!

Also since you can integrate this into any storage provider and configure an `ASSET_URL` per provider, this is also compatible with any pre-existing CDN setup.

![image](https://github.com/user-attachments/assets/04030d50-5789-4923-aba6-ce9cd569c8c1)

## ✨ Features

- 🖼️ **Media Processing**: Automatically generate variants of images and videos
- 🔄 **Smart Optimization**: Optimize assets based on usage patterns and requirements
- 💾 **Flexible Storage**: Support for multiple storage backends (local, S3, GCS, etc.)
- 📊 **Usage Analytics**: Track asset performance and delivery metrics
- 🔒 **Access Control**: Secure your assets with fine-grained permissions
- 🎯 **CMS Integration**: Simple remote asset picker for easy integration with any CMS
- 🚀 **Lightning Fast**: Optimized for performance with minimal dependencies
- 🏠 **Self-hostable**: Deploy anywhere - your server, VPS, or cloud platform

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and Bun 1.0+

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/idk.cdn.git
   cd idk.cdn
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Configure your storage provider:
   ```bash
   # Copy the example environment file
   cp .env.example .env.local
   
   # Edit .env.local to configure your storage provider
   # Supported providers: local, s3, gcs, etc.
   ```

4. Start the development server:
   ```bash
   bun dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to see your asset manager in action!

### CMS Integration

To integrate the asset picker into your CMS:

```jsx
import { AssetPicker } from '@idk/cdn';

// In your CMS component
<AssetPicker
  onSelect={(asset) => {
    // Handle selected asset
    console.log(asset.url);
  }}
  apiKey="your-api-key"
/>
```

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/)
- **Storage**: Support for multiple providers (local, S3, GCS, etc.)
- **Media Processing**: Image and video transformation pipeline
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide Icons](https://lucide.dev/)

## 🚀 Deployment

This application is designed to be easily self-hosted:

- **VPS**: Deploy on any VPS provider (DigitalOcean, Linode, etc.)
- **Docker**: Coming soon!
- **Cloud**: Deploy on any cloud platform (AWS, GCP, Azure)
- **Shared Hosting**: Works on any hosting that supports Node.js

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
