import React, { useState } from 'react';
import NavbarLandingPage from '@/components/Navbar-LandingPage';
import FooterLandingPage from '@/components/Footer-LandingPage';
import { BookOpen, Calendar, User, ArrowRight, Search, Tag } from 'lucide-react';

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const blogPosts = [
    {
      id: 1,
      title: 'How to Reduce Fleet Maintenance Costs by 40%',
      excerpt: 'Discover proven strategies to minimize maintenance expenses without compromising vehicle reliability and safety.',
      category: 'Cost Optimization',
      author: 'Sarah Johnson',
      date: 'November 20, 2025',
      readTime: '5 min read',
      image: '🛠️',
      content: 'Fleet maintenance is one of the largest operational expenses for any organization. In this comprehensive guide, we\'ll explore real-world strategies that have helped thousands of fleet managers reduce their maintenance costs by up to 40% without sacrificing vehicle safety or reliability.'
    },
    {
      id: 2,
      title: 'The Future of Fleet Management: AI and Predictive Maintenance',
      excerpt: 'Explore how artificial intelligence is transforming fleet operations through predictive analytics and proactive maintenance.',
      category: 'Technology',
      author: 'Michael Chen',
      date: 'November 18, 2025',
      readTime: '7 min read',
      image: '🤖',
      content: 'Artificial intelligence is revolutionizing how fleet managers operate their businesses. From predictive maintenance that prevents breakdowns before they happen to AI-powered route optimization, the technology landscape for fleet management is rapidly evolving.'
    },
    {
      id: 3,
      title: 'Fleet Driver Safety: Best Practices and Training Programs',
      excerpt: 'Learn essential safety practices and training programs to improve driver performance and reduce accidents.',
      category: 'Safety',
      author: 'Emma Williams',
      date: 'November 15, 2025',
      readTime: '6 min read',
      image: '🚗',
      content: 'Driver safety is paramount in fleet management. This article covers the best practices for driver training, safety protocols, and how to create a culture of safety within your fleet organization.'
    },
    {
      id: 4,
      title: 'Digital Transformation in Logistics: A Step-by-Step Guide',
      excerpt: 'Navigate the digital transformation journey and optimize your logistics operations with modern technology solutions.',
      category: 'Industry Trends',
      author: 'James Rodriguez',
      date: 'November 12, 2025',
      readTime: '8 min read',
      image: '📊',
      content: 'Digital transformation is no longer optional in the logistics industry. This guide walks you through the key steps to digitize your operations, from vehicle tracking to automated reporting and analytics.'
    },
    {
      id: 5,
      title: 'Environmental Sustainability in Fleet Management',
      excerpt: 'Discover how to build a sustainable fleet while reducing carbon emissions and operational costs simultaneously.',
      category: 'Sustainability',
      author: 'Lisa Anderson',
      date: 'November 10, 2025',
      readTime: '6 min read',
      image: '🌱',
      content: 'Sustainability is becoming increasingly important in fleet management. Learn how companies are reducing their environmental impact through vehicle selection, route optimization, and maintenance practices.'
    },
    {
      id: 6,
      title: 'Real-Time Fleet Tracking: Benefits and Implementation',
      excerpt: 'Maximize operational efficiency with real-time tracking technology and improve customer satisfaction.',
      category: 'Technology',
      author: 'David Martinez',
      date: 'November 8, 2025',
      readTime: '5 min read',
      image: '📍',
      content: 'Real-time fleet tracking has become essential for modern fleet operations. Discover the benefits of implementing GPS tracking technology and how it can transform your business operations.'
    },
    {
      id: 7,
      title: 'Budget Planning for Fleet Operations: Annual Guide',
      excerpt: 'Master fleet budgeting strategies and allocate resources effectively to maximize ROI.',
      category: 'Cost Optimization',
      author: 'Rachel Green',
      date: 'November 5, 2025',
      readTime: '7 min read',
      image: '💰',
      content: 'Proper budget planning is crucial for fleet success. This annual guide covers everything from vehicle acquisition costs to maintenance budgets and fuel expenses.'
    },
    {
      id: 8,
      title: 'Compliance and Regulations: Staying Ahead of Changes',
      excerpt: 'Stay compliant with the latest industry regulations and avoid costly penalties.',
      category: 'Compliance',
      author: 'Thomas Wilson',
      date: 'November 1, 2025',
      readTime: '6 min read',
      image: '⚖️',
      content: 'Fleet compliance requirements are constantly evolving. Learn how to stay updated with regulations and implement systems to ensure your fleet remains compliant.'
    }
  ];

  const categories = ['all', 'Cost Optimization', 'Technology', 'Safety', 'Industry Trends', 'Sustainability', 'Compliance'];

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white text-neutral-900 antialiased font-inter">
      {/* Background Gradient Overlay */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-neutral-100/30 via-neutral-100/20 to-neutral-100/20 blur-3xl opacity-40"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-neutral-50/20 via-neutral-50/20 to-neutral-50/20 blur-3xl opacity-30"></div>
      </div>

      <NavbarLandingPage />

      <main className="sm:px-6 lg:px-8 max-w-7xl mx-auto px-4">
        {/* Hero Section */}
        <section className="py-16 text-center">
          <div className="flex justify-center mb-8">
            <BookOpen className="h-16 w-16 text-neutral-900" />
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-900 mb-4 leading-[1.1]">
            Fleety Blog
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Stay updated with industry insights, fleet management tips, and best practices from our experts.
          </p>
        </section>

        {/* Search and Filter Section */}
        <section className="py-12 border-t border-neutral-200">
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    {category === 'all' ? 'All Articles' : category}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-12 border-t border-neutral-200">
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:shadow-lg hover:scale-105 transition-all duration-300 hover:border-neutral-300 group cursor-pointer"
                >
                  {/* Post Image/Icon */}
                  <div className="h-48 bg-gradient-to-br from-neutral-100 to-neutral-50 flex items-center justify-center border-b border-neutral-200 text-6xl group-hover:scale-110 transition-transform duration-300">
                    {post.image}
                  </div>

                  {/* Post Content */}
                  <div className="p-6">
                    {/* Category Badge */}
                    <div className="inline-block mb-3">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-neutral-100 text-neutral-700 text-xs font-medium rounded-full">
                        <Tag className="h-3 w-3" />
                        {post.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-neutral-900 mb-2 line-clamp-2 group-hover:text-neutral-700">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>

                    {/* Meta Information */}
                    <div className="flex flex-col gap-3 mb-4 text-xs text-neutral-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {post.date}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {post.author}
                        </div>
                        <span className="text-neutral-400">{post.readTime}</span>
                      </div>
                    </div>

                    {/* Read More Button */}
                    <button className="inline-flex items-center gap-2 text-sm font-medium text-neutral-900 hover:text-neutral-700 group-hover:translate-x-1 transition-transform duration-300">
                      <span>Read More</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <BookOpen className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-600 mb-2">No articles found</h3>
              <p className="text-neutral-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </section>

        {/* Newsletter CTA Section */}
        <section className="py-16 border-t border-neutral-200 mb-16">
          <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-3xl p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Never Miss an Update</h2>
            <p className="text-lg text-neutral-100 mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter for the latest fleet management insights, tips, and best practices delivered to your inbox.
            </p>
            <div className="flex gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-100"
              />
              <button className="px-6 py-3 bg-white text-neutral-900 font-medium rounded-lg hover:bg-neutral-100 transition-colors duration-300 hover:scale-105">
                Subscribe
              </button>
            </div>
          </div>
        </section>
      </main>

      <FooterLandingPage />
    </div>
  );
};

export default Blog;
