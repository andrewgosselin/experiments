# Nori's World - Optimized Cat Photo Gallery

A high-performance, optimized photo gallery built with Next.js 15, featuring your adorable cat Nori in various adorable moments.

## 🚀 Features

- **Image Optimization**: Next.js Image component with WebP/AVIF support
- **Virtual Scrolling**: Handles thousands of images smoothly
- **Lazy Loading**: Images load only when needed
- **Search & Filtering**: Find photos by title, description, or tags
- **Responsive Design**: Works perfectly on all devices
- **Dark Mode**: Beautiful dark/light theme support
- **Performance**: Optimized for speed with skeleton loading

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Performance**: Virtual scrolling, lazy loading, code splitting

## 📸 Getting Started

### 1. Install Dependencies

```bash
npm install
# or
bun install
```

### 2. Add Your Cat Photos

1. Create a `public/nori/` folder
2. Add your cat photos (JPG, PNG, WebP recommended)
3. Update `src/data/nori-photos.ts` with your photo information

### 3. Run Development Server

```bash
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to see your gallery.

## 📁 Project Structure

```
nori-pics/
├── src/
│   ├── app/
│   │   └── page.tsx          # Main gallery page
│   ├── components/
│   │   ├── PhotoGrid.tsx     # Regular photo grid
│   │   ├── VirtualPhotoGrid.tsx # Virtual scrolling grid
│   │   └── OptimizedImage.tsx   # Optimized image component
│   └── data/
│       └── nori-photos.ts    # Photo data and metadata
├── public/
│   └── nori/                 # Your cat photos go here
└── next.config.ts            # Next.js optimization config
```

## 🎯 Performance Optimizations

### Image Optimization
- **WebP/AVIF Support**: Modern image formats for smaller file sizes
- **Responsive Sizes**: Automatically serves appropriate image sizes
- **Lazy Loading**: Images load only when scrolled into view
- **Blur Placeholders**: Smooth loading experience

### Code Optimization
- **Dynamic Imports**: Components load only when needed
- **Virtual Scrolling**: Handles large collections efficiently
- **Intersection Observer**: Optimized lazy loading
- **Code Splitting**: Smaller initial bundle size

### Caching
- **30-day Cache TTL**: Images cached for optimal performance
- **Device-specific Sizes**: Optimized for different screen sizes
- **CDN Ready**: Perfect for deployment on Vercel, Netlify, etc.

## 📱 Adding Your Photos

1. **Upload Photos**: Place your cat photos in `public/nori/`
2. **Update Data**: Edit `src/data/nori-photos.ts`:

```typescript
{
  id: 'unique-id',
  src: '/nori/your-photo.jpg',
  alt: 'Description for accessibility',
  title: 'Photo Title',
  category: 'sleeping', // or 'playing', 'eating', 'exploring', 'cuddling'
  date: '2024-01-15',
  description: 'What was happening in this photo?',
  tags: ['sleep', 'couch', 'sunlight']
}
```

## 🎨 Customization

### Categories
Add new categories in `src/data/nori-photos.ts`:
```typescript
export const categories = ['all', 'sleeping', 'playing', 'eating', 'exploring', 'cuddling', 'your-new-category'] as const;
```

### Styling
- Modify Tailwind classes in components
- Update color scheme in `tailwind.config.ts`
- Customize animations and transitions

### Layout
- Adjust grid columns in `PhotoGrid.tsx`
- Modify virtual scrolling parameters in `VirtualPhotoGrid.tsx`
- Update image aspect ratios and sizing

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Other Platforms
```bash
npm run build
npm run start
```

## 📊 Performance Tips

1. **Image Sizes**: Use appropriately sized images (max 1920px width)
2. **File Formats**: Prefer WebP or AVIF for best compression
3. **Metadata**: Add descriptive alt text and tags for better UX
4. **Categories**: Use consistent categories for better filtering

## 🐛 Troubleshooting

### Images Not Loading
- Check file paths in `public/nori/`
- Verify image URLs in `nori-photos.ts`
- Ensure images are valid JPG/PNG/WebP files

### Performance Issues
- Use virtual scrolling for 50+ images
- Optimize image file sizes
- Check browser console for errors

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

MIT License - feel free to use this for your own cat photo galleries!

---

**Made with ❤️ for Nori and all the other adorable cats out there!** 🐱
