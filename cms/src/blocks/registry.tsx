export const blockRegistry = {
    "header": {
        title: "Header",
        fields: [
            {
                title: "Logo Text",
                slug: "logoText",
                type: "text",
                required: true
            },
            {
                title: "Tagline",
                slug: "tagline",
                type: "text",
                required: false
            },
            {
                title: "Position",
                slug: "position",
                type: "select",
                options: [
                    { value: "integrated", label: "Integrated" },
                    { value: "sticky", label: "Sticky" },
                    { value: "relative", label: "Relative" }
                ],
                required: true
            },
            {
                title: "Background Color",
                slug: "backgroundColor",
                type: "color",
                required: false
            }
        ],
        render: (section: any) => {
            const menuItems = ["Home", "About", "Services", "Contact"];

            // Determine position classes based on selection
            const getPositionClasses = () => {
                switch (section.position) {
                    case "sticky":
                        return "sticky top-0 z-50";
                    case "relative":
                        return "relative";
                    case "integrated":
                    default:
                        return "absolute top-0 left-0 right-0 z-50";
                }
            };

            // Get background color with fallback
            const getBackgroundColor = () => {
                if (section.backgroundColor) {
                    return section.backgroundColor;
                }
                return "rgba(255, 255, 255, 0.95)"; // Default with transparency
            };

            return (
                <div
                    className={`w-full min-h-[80px] border-b border-gray-200 relative overflow-hidden ${getPositionClasses()}`}
                    style={{ backgroundColor: getBackgroundColor() }}
                >
                    <div className="flex items-center justify-between px-8 py-4">
                        {/* Logo */}
                        <div className="flex items-center">
                            <div className="text-2xl font-bold text-gray-900 mr-3">
                                {section.logoText || "LOGO"}
                            </div>
                            {section.tagline && (
                                <div className="text-sm text-gray-600 hidden md:block">
                                    {section.tagline}
                                </div>
                            )}
                        </div>

                        {/* Navigation */}
                        <nav className="hidden md:flex items-center space-x-8">
                            {menuItems.map((item, index) => (
                                <a
                                    key={index}
                                    href="#"
                                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                                >
                                    {item}
                                </a>
                            ))}
                        </nav>

                        {/* CTA Button */}
                        <div className="flex items-center space-x-4">
                            <button className="hidden md:block text-gray-700 hover:text-blue-600 font-medium transition-colors">
                                Sign In
                            </button>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                                Get Started
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button className="md:hidden p-2">
                            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>

                    <div className="absolute top-4 right-4 text-gray-300 text-xs font-medium">
                        Header Section ({section.position || "integrated"})
                    </div>
                </div>
            )
        }
    },
    "hero": {
        title: "Hero",
        fields: [
            {
                title: "Title",
                slug: "title",
                type: "text",
                required: true
            },
            {
                title: "Description",
                slug: "description",
                type: "text",
                required: true
            }
        ],
        render: (section: any) => {
            return (
                <div className="w-full min-h-[400px] bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
                        <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12"></div>
                        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white rounded-full opacity-50"></div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col justify-center items-center text-center h-full p-8">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                            {section.title || "Welcome to Our Platform"}
                        </h1>
                        <p className="text-xl text-blue-100 max-w-2xl mb-8 leading-relaxed">
                            {section.description || "Transform your ideas into reality with our powerful tools and innovative solutions designed for the modern world."}
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors duration-200 shadow-lg">
                                Get Started
                            </button>
                            <button className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors duration-200">
                                Learn More
                            </button>
                        </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute bottom-4 left-4 text-white/30 text-sm">
                        Hero Section
                    </div>
                </div>
            )
        }
    },
    "text": {
        title: "Text",
        fields: [
            {
                title: "Content",
                slug: "content",
                type: "text",
                required: true
            }
        ],
        render: (section: any) => {
            return (
                <div className="w-full min-h-[200px] bg-white shadow-sm border border-gray-200 relative overflow-hidden">
                    {/* Subtle Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-4 right-4 w-16 h-16 bg-gray-400 rounded-full"></div>
                        <div className="absolute bottom-4 left-4 w-8 h-8 bg-gray-400 rounded-full"></div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 p-8">
                        <div className="prose prose-lg max-w-none">
                            <div className="text-gray-800 leading-relaxed">
                                {section.content || "This is a sample text content section. You can add your own content here to display important information, articles, or any text-based content for your website."}
                            </div>
                        </div>

                        {/* Reading Time Indicator */}
                        <div className="mt-6 flex items-center text-sm text-gray-500">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>2 min read</span>
                        </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute top-4 right-4 text-gray-300 text-xs font-medium">
                        Text Section
                    </div>
                </div>
            )
        }
    },
    "features": {
        title: "Features",
        fields: [
            {
                title: "Title",
                slug: "title",
                type: "text",
                required: true
            },
            {
                title: "Description",
                slug: "description",
                type: "text",
                required: true
            }
        ],
        render: (section: any) => {
            const features = [
                { icon: "🚀", title: "Fast Performance", desc: "Lightning-fast loading times" },
                { icon: "🛡️", title: "Secure", desc: "Enterprise-grade security" },
                { icon: "📱", title: "Responsive", desc: "Works on all devices" },
                { icon: "⚡", title: "Scalable", desc: "Grows with your business" }
            ];

            return (
                <div className="w-full min-h-[300px] bg-gradient-to-br from-gray-50 to-white border border-gray-200 relative overflow-hidden">
                    {/* Header */}
                    <div className="p-8 text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            {section.title || "Why Choose Us"}
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            {section.description || "Discover the features that make our platform the perfect choice for your needs."}
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="px-8 pb-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {features.map((feature, index) => (
                                <div key={index} className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="text-3xl mb-3">{feature.icon}</div>
                                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                                    <p className="text-sm text-gray-600">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="absolute top-4 right-4 text-gray-300 text-xs font-medium">
                        Features Section
                    </div>
                </div>
            )
        }
    },
    "testimonials": {
        title: "Testimonials",
        fields: [
            {
                title: "Title",
                slug: "title",
                type: "text",
                required: true
            }
        ],
        render: (section: any) => {
            const testimonials = [
                { name: "Sarah Johnson", role: "CEO, TechCorp", content: "This platform transformed our workflow completely. Highly recommended!", avatar: "👩‍💼" },
                { name: "Mike Chen", role: "Designer", content: "The best tool I've ever used for content management.", avatar: "👨‍🎨" },
                { name: "Emma Davis", role: "Marketing Manager", content: "Incredible features and amazing support team!", avatar: "👩‍💻" }
            ];

            return (
                <div className="w-full min-h-[300px] bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 relative overflow-hidden">
                    <div className="p-8">
                        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                            {section.title || "What Our Clients Say"}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {testimonials.map((testimonial, index) => (
                                <div key={index} className="bg-white p-6 shadow-sm border border-gray-200">
                                    <div className="flex items-center mb-4">
                                        <div className="text-2xl mr-3">{testimonial.avatar}</div>
                                        <div>
                                            <div className="font-semibold text-gray-900">{testimonial.name}</div>
                                            <div className="text-sm text-gray-600">{testimonial.role}</div>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 italic">"{testimonial.content}"</p>
                                    <div className="flex text-yellow-400 mt-3">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="absolute top-4 right-4 text-indigo-300 text-xs font-medium">
                        Testimonials Section
                    </div>
                </div>
            )
        }
    },
    "contact": {
        title: "Contact",
        fields: [
            {
                title: "Title",
                slug: "title",
                type: "text",
                required: true
            },
            {
                title: "Email",
                slug: "email",
                type: "text",
                required: true
            }
        ],
        render: (section: any) => {
            return (
                <div className="w-full min-h-[300px] bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 relative overflow-hidden">
                    <div className="p-8">
                        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                            {section.title || "Get In Touch"}
                        </h2>

                        <div className="max-w-2xl mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Contact Info */}
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900">Email</div>
                                            <div className="text-gray-600">{section.email || "hello@example.com"}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900">Phone</div>
                                            <div className="text-gray-600">+1 (555) 123-4567</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Form */}
                                <div className="space-y-4">
                                    <input type="text" placeholder="Your Name" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                                    <input type="email" placeholder="Your Email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                                    <textarea placeholder="Your Message" rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"></textarea>
                                    <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-semibold">
                                        Send Message
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="absolute top-4 right-4 text-green-300 text-xs font-medium">
                        Contact Section
                    </div>
                </div>
            )
        }
    },
    "gallery": {
        title: "Gallery",
        fields: [
            {
                title: "Title",
                slug: "title",
                type: "text",
                required: true
            }
        ],
        render: (section: any) => {
            const images = [
                { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop", alt: "Mountain Landscape" },
                { src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=200&fit=crop", alt: "Forest Path" },
                { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop", alt: "Ocean View" },
                { src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=200&fit=crop", alt: "City Skyline" },
                { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop", alt: "Desert Sunset" },
                { src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=200&fit=crop", alt: "Lakeside View" }
            ];

            return (
                <div className="w-full min-h-[300px] bg-white border border-gray-200 relative overflow-hidden">
                    <div className="p-8">
                        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                            {section.title || "Our Gallery"}
                        </h2>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {images.map((image, index) => (
                                <div key={index} className="relative group overflow-hidden rounded-lg">
                                    <img
                                        src={image.src}
                                        alt={image.alt}
                                        className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                                        <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                        </svg>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="absolute top-4 right-4 text-gray-300 text-xs font-medium">
                        Gallery Section
                    </div>
                </div>
            )
        }
    },
    "stats": {
        title: "Stats",
        fields: [
            {
                title: "Title",
                slug: "title",
                type: "text",
                required: true
            }
        ],
        render: (section: any) => {
            const stats = [
                { number: "10K+", label: "Happy Customers", icon: "👥" },
                { number: "500+", label: "Projects Completed", icon: "✅" },
                { number: "99%", label: "Satisfaction Rate", icon: "⭐" },
                { number: "24/7", label: "Support Available", icon: "🛟" }
            ];

            return (
                <div className="w-full min-h-[250px] bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full translate-x-16 -translate-y-16"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -translate-x-12 translate-y-12"></div>
                    </div>

                    <div className="relative z-10 p-8">
                        <h2 className="text-3xl font-bold text-center text-white mb-8">
                            {section.title || "Our Numbers"}
                        </h2>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className="text-3xl mb-2">{stat.icon}</div>
                                    <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                                    <div className="text-blue-100 text-sm">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="absolute top-4 right-4 text-white/50 text-xs font-medium">
                        Stats Section
                    </div>
                </div>
            )
        }
    },
    "footer": {
        title: "Footer",
        fields: [
            {
                title: "Company Name",
                slug: "companyName",
                type: "text",
                required: true
            },
            {
                title: "Tagline",
                slug: "tagline",
                type: "text",
                required: false
            }
        ],
        render: (section: any) => {
            const footerLinks = {
                "Company": ["About", "Careers", "Press", "Blog"],
                "Product": ["Features", "Pricing", "API", "Documentation"],
                "Support": ["Help Center", "Contact", "Status", "Community"],
                "Legal": ["Privacy", "Terms", "Security", "Cookies"]
            };

            return (
                <div className="w-full min-h-[300px] bg-gray-900 text-white relative overflow-hidden">
                    <div className="p-8">
                        <div className="max-w-6xl mx-auto">
                            {/* Top Section */}
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
                                {/* Company Info */}
                                <div className="md:col-span-2">
                                    <div className="text-2xl font-bold mb-4">
                                        {section.companyName || "Your Company"}
                                    </div>
                                    {section.tagline && (
                                        <p className="text-gray-400 mb-6 max-w-md">
                                            {section.tagline}
                                        </p>
                                    )}
                                    <div className="flex space-x-4">
                                        <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                                            </svg>
                                        </a>
                                        <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                                            </svg>
                                        </a>
                                        <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>

                                {/* Footer Links */}
                                {Object.entries(footerLinks).map(([category, links]) => (
                                    <div key={category}>
                                        <h3 className="font-semibold mb-4">{category}</h3>
                                        <ul className="space-y-2">
                                            {links.map((link, index) => (
                                                <li key={index}>
                                                    <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                                                        {link}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>

                            {/* Bottom Section */}
                            <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
                                <div className="text-gray-400 text-sm mb-4 md:mb-0">
                                    © 2024 {section.companyName || "Your Company"}. All rights reserved.
                                </div>
                                <div className="flex space-x-6 text-sm">
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="absolute top-4 right-4 text-gray-600 text-xs font-medium">
                        Footer Section
                    </div>
                </div>
            )
        }
    }
}