import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader, Sparkles, Zap, Plus, Wrench, Droplets, Download, Bot } from 'lucide-react';
import { apiRequest } from '@/api/client';

interface FAQItem {
  _id?: string;
  question: string;
  answer: string;
  embedding?: number[];
}

interface GreetingData {
  greeting: string;
  personalized: boolean;
  username?: string;
  persona: string;
  interaction_count: number;
  last_seen?: string;
}

interface Analytics {
  faq_matched: boolean;
  similarity_score: number;
  persona_used: string;
  sentiment: string;
  sentiment_score: number;
  fallback_ai_used: boolean;
  misunderstanding_risk: number;
  misunderstanding_indicators: string[];
}

interface AssistantResponse {
  question: string;
  answer: string;
  relevantFAQs: FAQItem[];
  grounding_confidence?: number;
  is_grounded?: boolean;
  intent?: string;
  analytics?: Analytics;
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  relatedFAQs?: FAQItem[];
  analytics?: Analytics;
  timestamp?: string;
}

export const FAQAssistant: React.FC = () => {
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [showSupportForm, setShowSupportForm] = useState(false);
  const [supportForm, setSupportForm] = useState({ name: '', email: '', inquiry: '' });
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [greeting, setGreeting] = useState<GreetingData | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [lastAnalytics, setLastAnalytics] = useState<Analytics | null>(null);
  const [interactionCount, setInteractionCount] = useState(0);

  const modalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get user name from localStorage
  useEffect(() => {
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo);
        setUserName(user.name || user.email?.split('@')[0] || 'there');
      } catch {
        setUserName(null);
      }
    }
  }, []);

  // Focus trap for accessibility
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Load initial FAQs and greeting
  useEffect(() => {
    if (isOpen && faqs.length === 0) {
      fetchFAQs();
      fetchGreeting();
    }
  }, [isOpen, faqs.length]);

  /**
   * Fetch all FAQs from backend
   */
  const fetchFAQs = async () => {
    try {
      const data = await apiRequest('/api/faq/all');
      setFaqs(data.faqs);
    } catch (err) {
      console.error('Error fetching FAQs:', err);
      setError('Could not load FAQs');
    }
  };

  /**
   * Fetch personalized greeting from backend
   */
  const fetchGreeting = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await apiRequest('/api/faq/greeting', {
        method: 'GET',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      setGreeting(response);
      setInteractionCount(response.interaction_count);
    } catch (err) {
      console.error('Error fetching greeting:', err);
      // Fallback to generic greeting
      setGreeting({
        greeting: 'Hello! How can I help you today?',
        personalized: false,
        persona: 'friendly',
        interaction_count: 0
      });
    }
  };

  /**
   * Search FAQs using RAG system
   * Sends query to backend which uses vector embeddings + LLM
   */
  const handleSearch = async (e: React.FormEvent | null, query?: string) => {
    if (e) {
      e.preventDefault();
    }

    const finalQuery = query || searchQuery.trim();
    
    if (!finalQuery) {
      return;
    }

    // Clear input immediately
    setSearchQuery('');
    setLoading(true);
    setError(null);

    try {
      // Add user message immediately
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: finalQuery,
      };

      setMessages((prev) => [...prev, userMessage]);

      // Get AI response
      const data = await apiRequest('/api/faq/search', {
        method: 'POST',
        body: JSON.stringify({ query: finalQuery }),
      });

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.answer,
        relatedFAQs: data.relevantFAQs,
        analytics: data.analytics,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setLastAnalytics(data.analytics);
      setInteractionCount(interactionCount + 1);
    } catch (err) {
      console.error('Search error:', err);
      setError('Could not search FAQs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Format text with proper line breaks
   */
  const formatText = (text: string): React.ReactNode => {
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  /**
   * Get sentiment emoji and color
   */
  const getSentimentEmoji = (sentiment: string) => {
    const sentiments: Record<string, string> = {
      'positive': '😊',
      'neutral': '😐',
      'negative': '😟',
      'frustrated': '😤'
    };
    return sentiments[sentiment] || '😐';
  };

  /**
   * Get quality indicator for grounding confidence
   */
  const getQualityIndicator = (confidence?: number) => {
    if (!confidence) return null;
    if (confidence >= 0.8) return { color: 'text-green-600', label: 'High Confidence', icon: '✓' };
    if (confidence >= 0.6) return { color: 'text-yellow-600', label: 'Medium Confidence', icon: '~' };
    return { color: 'text-orange-600', label: 'Lower Confidence', icon: '!' };
  };

  /**
   * Submit support inquiry if AI can't help
   */
  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supportForm.name || !supportForm.email || !supportForm.inquiry) {
      setError('Please fill in all fields');
      return;
    }

    setSupportLoading(true);
    setError(null);

    try {
      const response = await apiRequest('/api/support/inquire', {
        method: 'POST',
        body: JSON.stringify({
          name: supportForm.name,
          email: supportForm.email,
          inquiry: supportForm.inquiry,
        }),
      });

      setSupportSuccess(true);

      // Add message to chat
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: supportForm.inquiry,
      };

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.answer || 
                (response.answered_by_ai 
                  ? 'Your question has been answered by our AI.' 
                  : 'Thank you for your inquiry. Our support team has received your message and will respond shortly. ' + 
                    (response.ticket_id ? `Your ticket ID is: ${response.ticket_id}` : '')),
        relatedFAQs: [],
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setSupportForm({ name: '', email: '', inquiry: '' });
      setShowSupportForm(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSupportSuccess(false), 3000);
    } catch (err) {
      console.error('Support inquiry error:', err);
      setError('Failed to submit inquiry. Please try again.');
    } finally {
      setSupportLoading(false);
    }
  };

  // ========== RENDER ==========

  return (
    <>
      {/* Floating Help Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open Fleety Assistant"
        aria-expanded={isOpen}
        className="fixed bottom-6 right-6 z-40 p-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-900 transition-all duration-300 transform hover:scale-110 active:scale-95"
        title="Fleety Assistant"
      >
        <MessageCircle size={24} />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
          role="presentation"
        />
      )}

      {/* Modal Container */}
      {isOpen && (
        <div
          ref={modalRef}
          className="fixed bottom-20 right-6 z-50 w-full md:w-[480px] max-h-[680px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300"
          role="dialog"
          aria-labelledby="faq-title"
          aria-modal="true"
        >
          {/* Header - Professional Gray/Black Gradient */}
          <div className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 text-white p-5 flex justify-between items-start shadow-md">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white bg-opacity-20 p-2 rounded-lg backdrop-blur-sm">
                  <Bot size={20} />
                </div>
                <div>
                  <h2 id="faq-title" className="text-white font-bold text-lg">
                    Fleety Assistant
                  </h2>
                  <p className="text-gray-300 text-xs">AI-Powered Fleet Management Helper</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close Fleety Assistant"
              className="text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Chat Messages Area - Fixed Height Scrollable */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 animate-shake">
                <div className="text-red-500 flex-shrink-0">⚠️</div>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Initial Empty State - Welcome Message */}
            {messages.length === 0 && !loading && (
              <div className="flex flex-col gap-4 h-full justify-start">
                {/* AI Welcome Bubble */}
                <div className="flex gap-3 animate-in fade-in slide-in-from-left-4 duration-500">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
                    <Bot size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 border border-gray-300 rounded-3xl rounded-tl-none px-4 py-3 max-w-sm shadow-sm hover:shadow-md transition-shadow">
                      <p className="text-gray-800 text-sm leading-relaxed">
                        Hello! I'm your Fleety Assistant. How may I help you with vehicle management, maintenance, or fuel tracking today?
                      </p>
                    </div>
                    <p className="text-gray-400 text-xs mt-2 ml-2">Just now</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 space-y-2">
                  <p className="text-gray-600 text-xs font-semibold px-2">Quick Actions:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleSearch(null, "How do I add a new vehicle?")}
                      className="bg-white border-2 border-gray-300 hover:border-gray-500 hover:bg-gray-100 text-gray-700 text-xs font-medium px-3 py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group"
                      title="Add vehicle information"
                    >
                      <Plus size={16} className="text-gray-700 group-hover:scale-110 transition-transform" />
                      <span>Add Vehicle</span>
                    </button>
                    <button
                      onClick={() => handleSearch(null, "Tell me about maintenance scheduling")}
                      className="bg-white border-2 border-green-200 hover:border-green-400 hover:bg-green-50 text-gray-700 text-xs font-medium px-3 py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group"
                      title="Maintenance information"
                    >
                      <Wrench size={16} className="text-green-600 group-hover:scale-110 transition-transform" />
                      <span>Maintenance</span>
                    </button>
                    <button
                      onClick={() => handleSearch(null, "How do I track fuel consumption?")}
                      className="bg-white border-2 border-amber-200 hover:border-amber-400 hover:bg-amber-50 text-gray-700 text-xs font-medium px-3 py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group"
                      title="Fuel tracking"
                    >
                      <Droplets size={16} className="text-amber-600 group-hover:scale-110 transition-transform" />
                      <span>Fuel Tracking</span>
                    </button>
                    <button
                      onClick={() => handleSearch(null, "How can I export my fleet data?")}
                      className="bg-white border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 text-gray-700 text-xs font-medium px-3 py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group"
                      title="Export data"
                    >
                      <Download size={16} className="text-purple-600 group-hover:scale-110 transition-transform" />
                      <span>Export Data</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Conversation Messages */}
            {messages.map((msg, idx) => (
              <div key={msg.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {msg.type === 'user' ? (
                  // User Message Bubble
                  <>
                    <div className="flex-1" />
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-bold">
                      U
                    </div>
                    <div className="flex-shrink-0 max-w-sm">
                      <div className="bg-gradient-to-br from-gray-700 to-gray-800 text-white rounded-3xl rounded-tr-none px-4 py-3 shadow-md hover:shadow-lg transition-shadow">
                        <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                      </div>
                      {msg.timestamp && (
                        <p className="text-gray-400 text-xs mt-2 text-right pr-2">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  // AI Assistant Message Bubble
                  <>
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
                      <Bot size={18} />
                    </div>
                    <div className="flex-1 max-w-sm">
                      <div className="bg-gray-100 border-2 border-gray-300 rounded-3xl rounded-tl-none px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-gray-800 text-sm leading-relaxed break-words">
                          {formatText(msg.content)}
                        </p>
                      </div>

                      {/* Quality Indicators */}
                      {msg.analytics && (
                        <div className="mt-3 flex flex-wrap gap-2 text-xs ml-2">
                          {msg.analytics.faq_matched && (
                            <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full border border-green-300 font-medium">
                              ✓ From FAQ
                            </span>
                          )}
                          {!msg.analytics.faq_matched && msg.analytics.fallback_ai_used && (
                            <span className="bg-gray-200 text-gray-800 px-2.5 py-1 rounded-full border border-gray-400 font-medium">
                              🤖 AI Generated
                            </span>
                          )}
                          {msg.analytics.similarity_score > 0 && (
                            <span className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full border border-purple-300 font-medium">
                              {Math.round(msg.analytics.similarity_score * 100)}% Match
                            </span>
                          )}
                        </div>
                      )}

                      {/* Related FAQs */}
                      {msg.relatedFAQs && msg.relatedFAQs.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200 ml-2">
                          <p className="text-gray-600 text-xs font-semibold mb-2">Related topics:</p>
                          <div className="space-y-1.5">
                            {msg.relatedFAQs.map((faq) => (
                              <button
                                key={faq._id}
                                onClick={() => handleSearch(null, faq.question)}
                                className="block w-full text-left text-xs text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition border border-gray-300 hover:border-gray-400 truncate font-medium"
                              >
                                → {faq.question}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {msg.timestamp && (
                        <p className="text-gray-400 text-xs mt-2 ml-2">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}

            {/* Loading/Typing Indicator */}
            {loading && (
              <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
                  <Bot size={18} />
                </div>
                <div className="bg-gray-100 border-2 border-gray-300 rounded-3xl rounded-tl-none px-4 py-3 shadow-sm">
                  <div className="flex gap-1.5 items-center h-5">
                    <div className="w-2.5 h-2.5 bg-gray-500 rounded-full animate-bounce" />
                    <div className="w-2.5 h-2.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2.5 h-2.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Scroll Anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area - Bottom */}
          <div className="border-t border-gray-200 bg-white p-4 space-y-3 shadow-lg">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Type your question about vehicles, maintenance, exports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Ask Fleety Assistant"
                className="flex-1 px-4 py-3 text-sm border-2 border-gray-300 rounded-full focus:outline-none focus:border-gray-700 focus:ring-2 focus:ring-gray-200 transition-all bg-gray-50 hover:bg-white"
              />
              <button
                type="submit"
                disabled={loading || !searchQuery.trim()}
                aria-label="Send message"
                className="flex-shrink-0 p-3 bg-gray-800 text-white rounded-full hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <Loader size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </form>

            {/* Quick Action Text */}
            <p className="text-center text-gray-500 text-xs">
              💡 Tip: Use quick action buttons above or type your question naturally
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default FAQAssistant;
