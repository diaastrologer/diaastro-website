import React, { useState, useEffect } from 'react';
import { Star, Phone, Mail, Calendar, MessageCircle, ChevronDown, Menu, X, MapPin, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import { saveLeadApi, askGuidanceApi, palmReadingApi } from './services/astroApi';

// ─── Static data outside component to avoid stale closure warnings ───────────
const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    location: "Delhi",
    text: "Ruchi ji's guidance helped me secure my dream job at the exact time she predicted. Her career astrology predictions were spot-on!",
    rating: 5
  },
  {
    name: "Rajesh Gupta",
    location: "Mumbai",
    text: "I was skeptical about share market astrology, but following Ruchi ji's timing advice, I made significant profits. Truly grateful!",
    rating: 5
  },
  {
    name: "Anita & Vikram",
    location: "Bangalore",
    text: "Our marriage was on the rocks. Ruchi ji's analysis and counseling saved our relationship. We're happier than ever!",
    rating: 5
  },
  {
    name: "Suresh Kumar",
    location: "Pune",
    text: "Facing a difficult legal case, Ruchi ji suggested the right muhurat for court appearances. We won! Her legal astrology is phenomenal.",
    rating: 5
  },
  {
    name: "Neha Kapoor",
    location: "Chandigarh",
    text: "My business was struggling. After Ruchi ji's karma dosh analysis and timing guidance, revenue increased by 300% in 6 months!",
    rating: 5
  }
];

export default function DiaAstroWebsite() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Inline lead capture state (shared — submitted once, unlocks both features)
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [inlineName, setInlineName] = useState('');
  const [inlinePhone, setInlinePhone] = useState('');
  const [inlineError, setInlineError] = useState('');

  // Per-feature usage counters (max 2 each)
  const FEATURE_LIMIT = 2;
  const [palmUsageCount, setPalmUsageCount] = useState(0);
  const [guidanceUsageCount, setGuidanceUsageCount] = useState(0);

  const submitInlineLead = (feature) => {
    if (!inlineName.trim()) { setInlineError('Please enter your name.'); return; }
    const phoneClean = inlinePhone.replace(/\D/g, '');
    if (phoneClean.length < 10) { setInlineError('Please enter a valid 10-digit mobile number.'); return; }
    // Unlock immediately — no waiting for server
    setLeadSubmitted(true);
    setInlineError('');
    // Save to backend in background (fire-and-forget)
    saveLeadApi({ name: inlineName.trim(), phone: phoneClean, feature }).catch(() => {});
  };

  const [guidanceQuestion, setGuidanceQuestion] = useState('');
  const [guidanceResponse, setGuidanceResponse] = useState('');
  const [guidanceLoading, setGuidanceLoading] = useState(false);
  const [guidanceError, setGuidanceError] = useState('');

  // Palm Scanner state
  const [palmImage, setPalmImage] = useState(null);
  const [palmPreview, setPalmPreview] = useState(null);
  const [palmReading, setPalmReading] = useState('');
  const [palmLoading, setPalmLoading] = useState(false);
  const [palmError, setPalmError] = useState('');
  const [palmStyle, setPalmStyle] = useState('mystic');
  const [dragOver, setDragOver] = useState(false);

  const palmStyles = [
    { id: 'mystic', label: '🔮 Mystic', desc: 'Ancient spiritual wisdom' },
    { id: 'modern', label: '✨ Modern', desc: 'Contemporary insight' },
    { id: 'vedic', label: '🌙 Vedic', desc: 'Traditional Indian palmistry' },
  ];

  const handlePalmFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setPalmError('Please upload a valid image file (JPG, PNG, etc.)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPalmError('Image must be under 5MB');
      return;
    }
    setPalmError('');
    setPalmImage(file);
    setPalmPreview(URL.createObjectURL(file));
    setPalmReading('');
  };

  const scanPalm = async () => {
    if (!palmImage) return;
    if (!leadSubmitted) return;
    if (palmUsageCount >= FEATURE_LIMIT) return;
    setPalmLoading(true);
    setPalmError('');
    setPalmReading('');
    try {
      const data = await palmReadingApi(palmImage, palmStyle);
      if (data.success) {
        setPalmReading(data.reading);
        setPalmUsageCount(prev => prev + 1);
      } else {
        setPalmError(data.error || 'Unable to read palm. Please try again.');
      }
    } catch (e) {
      setPalmError('Could not connect to the astrology service. Please ensure the server is running.');
    } finally {
      setPalmLoading(false);
    }
  };

  const exampleQuestions = [
    "What does my birth chart reveal about my career prospects?",
    "When would be auspicious to start a new business?",
    "How can I resolve the Mangal Dosh in my horoscope?",
    "What planetary influences are affecting my relationships right now?",
    "Can you help me understand my financial prospects this year?"
  ];

  const askGuidance = async () => {
    if (!guidanceQuestion.trim()) return;
    if (!leadSubmitted) return;
    if (guidanceUsageCount >= FEATURE_LIMIT) return;
    setGuidanceLoading(true);
    setGuidanceError('');
    setGuidanceResponse('');
    try {
      const data = await askGuidanceApi(guidanceQuestion);
      if (data.success) {
        setGuidanceResponse(data.response);
        setGuidanceUsageCount(prev => prev + 1);
      } else {
        setGuidanceError(data.error || 'Unable to get guidance. Please try again.');
      }
    } catch (e) {
      setGuidanceError('Could not connect to the astrology service. Please ensure the server is running.');
    } finally {
      setGuidanceLoading(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const services = [
    {
      icon: "💼",
      title: "Career & Job Security",
      description: "Navigate your professional path with clarity. Get insights on job changes, promotions, career transitions, and optimal timing for new opportunities."
    },
    {
      icon: "📈",
      title: "Business and Finance Analysis",
      description: "Harness planetary wisdom for investment decisions. Learn auspicious timings for trading, business launches, and financial ventures aligned with cosmic energy."
    },
    {
      icon: "💕",
      title: "Love & Marriage Clarity",
      description: "Find harmony in relationships. Understand compatibility, resolve conflicts, and discover the right timing for marriage and commitment decisions."
    },
    {
      icon: "🤝",
      title: "Marriage Compatibility",
      description: "Deep horoscope matching for lifelong partnership. Analyze Kundli compatibility, doshas, and planetary influences for marital success."
    },
    {
      icon: "🏥",
      title: "Health & Wealth Predictions",
      description: "Preventive insights for wellbeing and prosperity. Identify health risks, financial opportunities, and analysis for lasting abundance."
    },
    {
      icon: "🌟",
      title: "Birth Chart Analysis",
      description: "Comprehensive Kundli reading revealing your life's blueprint. Understand your strengths, challenges, karmic patterns, and soul's purpose."
    },
    {
      icon: "🔮",
      title: "Karma Dosh Analysis",
      description: "Identify and resolve karmic debts. Specialized analysis for Mangal Dosh, Kaal Sarp Dosh, Pitra Dosh, and ancestral karma."
    },
    {
      icon: "📅",
      title: "Auspicious Muhurat Selection",
      description: "Choose perfect timings for life events. Muhurat for marriage, business launch, property purchase, travel, and important ceremonies."
    }
  ];

  const testimonials = TESTIMONIALS;

  const faqs = [
    {
      question: "How accurate is Vedic astrology?",
      answer: "Vedic astrology is an ancient science based on precise planetary calculations and time-tested principles. When analyzed by an experienced astrologer with accurate birth details (date, time, place), predictions can be remarkably accurate. However, astrology shows tendencies and probabilities, not absolute certainties. It empowers you with knowledge to make informed decisions."
    },
    {
      question: "How does a birth chart work?",
      answer: "A birth chart (Kundli) is a snapshot of planetary positions at your exact birth moment. Each planet, house, and zodiac sign represents different life areas. The unique combination of these factors reveals your personality, strengths, challenges, career path, relationships, health tendencies, and life timing. It's your cosmic blueprint."
    },
    {
      question: "Can astrology really predict share market trends?",
      answer: "Share market astrology analyzes planetary transits, especially Jupiter, Saturn, Rahu, and Ketu movements. Specific planetary combinations indicate bullish or bearish trends. While not a replacement for financial analysis, astrology provides timing insights - when to enter, hold, or exit positions for optimal results."
    },
    {
      question: "What is Karma Dosh and how to resolve it?",
      answer: "Karma Dosh refers to karmic debts from past actions (this life or previous lives) manifesting as obstacles. Common types include Mangal Dosh (affecting marriage), Kaal Sarp Dosh (blocking progress), and Pitra Dosh (ancestral karma). Analysis include specific mantras, gemstones, rituals, charity, and lifestyle corrections based on your unique chart."
    },
    {
      question: "How to choose the right muhurat?",
      answer: "Muhurat is the auspicious timing for important activities. It's calculated by analyzing: Tithi (lunar day), Nakshatra (constellation), Yoga, Karana, and planetary positions. For marriage, business, property, or travel, we select times when benefic planets are strong and malefics are subdued, ensuring success and minimal obstacles."
    },
    {
      question: "What information do I need for an accurate reading?",
      answer: "For precise predictions, provide: exact date of birth, accurate time of birth (check birth certificate), and place of birth. Even a few minutes' difference in birth time can change predictions. If time is unknown, we use Prashna Kundli (question chart) methods, though slightly less detailed."
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  return (
    <div className="astro-site">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Poppins:wght@300;400;500;600;700&family=Cinzel:wght@400;600;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          overflow-x: hidden;
        }

        .astro-site {
          font-family: 'Poppins', sans-serif;
          color: #F5F5F5;
          background: #0B0F2F;
          overflow-x: hidden;
        }

        /* Cosmic Background Animation */
        @keyframes floatParticles {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-30px) translateX(5px); }
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        @keyframes glow {
          0%, 100% { 
            filter: drop-shadow(0 0 15px rgba(212, 175, 55, 0.5)) drop-shadow(0 0 30px rgba(212, 175, 55, 0.3));
          }
          50% { 
            filter: drop-shadow(0 0 25px rgba(255, 215, 0, 0.8)) drop-shadow(0 0 50px rgba(255, 215, 0, 0.5));
          }
        }

        @keyframes buttonGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(212, 175, 55, 0.5), 0 0 40px rgba(212, 175, 55, 0.3); }
          50% { box-shadow: 0 0 30px rgba(212, 175, 55, 0.8), 0 0 60px rgba(212, 175, 55, 0.5); }
        }

        @keyframes whatsappGlow {
          0%, 100% { box-shadow: 0 4px 20px rgba(37, 211, 102, 0.5), 0 0 40px rgba(37, 211, 102, 0.3); }
          50% { box-shadow: 0 6px 30px rgba(37, 211, 102, 0.8), 0 0 60px rgba(37, 211, 102, 0.5); }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .cosmic-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
        }

        .star {
          position: absolute;
          width: 2px;
          height: 2px;
          background: white;
          border-radius: 50%;
          animation: twinkle 3s infinite;
        }

        /* Header */
        header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          padding: 1.5rem 2rem;
          transition: all 0.3s ease;
        }

        header.scrolled {
          background: rgba(11, 15, 47, 0.95);
          backdrop-filter: blur(10px);
          padding: 1rem 2rem;
          box-shadow: 0 4px 30px rgba(212, 175, 55, 0.1);
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 1rem;
          text-decoration: none;
          color: #F5F5F5;
        }

        .logo-icon {
          width: 50px;
          height: 50px;
          background: transparent;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: glow 3s infinite;
          position: relative;
        }
        
        .logo-icon svg {
          filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5));
        }

        .logo-text h1 {
          font-family: 'Cinzel', serif;
          font-size: 1.8rem;
          font-weight: 700;
          background: linear-gradient(135deg, #D4AF37, #FFD700);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
        }

        .logo-text p {
          font-size: 0.75rem;
          color: #D4AF37;
          margin: 0;
          letter-spacing: 2px;
        }

        nav ul {
          display: flex;
          gap: 2.5rem;
          list-style: none;
          align-items: center;
        }

        nav a {
          color: #F5F5F5;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.95rem;
          transition: color 0.3s;
          position: relative;
          cursor: pointer;
        }

        nav a::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #D4AF37, #FFD700);
          transition: width 0.3s;
        }

        nav a:hover::after {
          width: 100%;
        }

        nav a:hover {
          color: #FFD700;
        }

        /* nav and footer buttons styled to look like links */
        .nav-link {
          background: none;
          border: none;
          color: #F5F5F5;
          font-weight: 500;
          font-size: 0.95rem;
          font-family: 'Poppins', sans-serif;
          cursor: pointer;
          padding: 0;
          position: relative;
          transition: color 0.3s;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #D4AF37, #FFD700);
          transition: width 0.3s;
        }

        .nav-link:hover::after { width: 100%; }
        .nav-link:hover { color: #FFD700; }

        .footer-link {
          background: none;
          border: none;
          color: #C0C0C0;
          font-family: 'Poppins', sans-serif;
          font-size: 1rem;
          cursor: pointer;
          padding: 0;
          display: block;
          margin-bottom: 0.5rem;
          line-height: 1.8;
          text-align: left;
          transition: color 0.3s;
        }

        .footer-link:hover { color: #FFD700; }

        .footer-text {
          color: #C0C0C0;
          display: block;
          margin-bottom: 0.5rem;
          line-height: 1.8;
        }

        .menu-toggle {
          display: none;
          background: none;
          border: none;
          color: #F5F5F5;
          cursor: pointer;
          padding: 0.5rem;
        }

        /* Hero Section */
        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 8rem 2rem 4rem;
          background: linear-gradient(180deg, #0B0F2F 0%, #1A1F4F 100%);
        }

        .hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.1) 0%, transparent 70%);
          pointer-events: none;
        }

        .hero-content {
          max-width: 1200px;
          text-align: center;
          position: relative;
          z-index: 10;
          animation: fadeInUp 1s ease-out;
        }

        .hero h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 900;
          line-height: 1.2;
          margin-bottom: 1.5rem;
          background: linear-gradient(135deg, #FFD700, #D4AF37, #FFD700);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 4px 20px rgba(212, 175, 55, 0.3);
        }

        .hero-subtitle {
          font-size: clamp(1.1rem, 2.5vw, 1.5rem);
          color: #E0E0E0;
          margin-bottom: 1.5rem;
          font-weight: 300;
          letter-spacing: 0.5px;
        }

        .hero-highlight {
          display: inline-flex;
          align-items: flex-start;
          gap: 0.6rem;
          background: linear-gradient(135deg, rgba(212,175,55,0.15), rgba(255,215,0,0.08));
          border: 1px solid rgba(212,175,55,0.45);
          border-radius: 12px;
          padding: 0.9rem 1.4rem;
          margin-bottom: 2.5rem;
          font-size: clamp(0.85rem, 1.8vw, 1rem);
          color: #F0E6C0;
          font-weight: 400;
          line-height: 1.6;
          max-width: 680px;
          text-align: left;
          box-shadow: 0 0 18px rgba(212,175,55,0.12);
        }

        .hero-highlight-icon {
          font-size: 1.1rem;
          flex-shrink: 0;
          margin-top: 0.1rem;
        }

        .cta-buttons {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn {
          padding: 1rem 2.5rem;
          font-size: 1.1rem;
          font-weight: 600;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-family: 'Poppins', sans-serif;
        }

        .btn-primary {
          background: linear-gradient(135deg, #D4AF37, #FFD700);
          color: #0B0F2F;
          animation: buttonGlow 3s infinite;
        }

        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(212, 175, 55, 0.4);
        }

        .btn-secondary {
          background: transparent;
          color: #FFD700;
          border: 2px solid #D4AF37;
        }

        .btn-secondary:hover {
          background: rgba(212, 175, 55, 0.1);
          transform: translateY(-3px);
        }

        /* Section Styling */
        section {
          padding: 6rem 2rem;
          position: relative;
          z-index: 10;
        }

        .section-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 5vw, 3.5rem);
          text-align: center;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #FFD700, #D4AF37);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 700;
        }

        .section-subtitle {
          text-align: center;
          color: #B0B0B0;
          font-size: 1.1rem;
          margin-bottom: 4rem;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
        }

        /* Services */
        .services-grid {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 2rem;
        }

        .service-card {
          background: linear-gradient(145deg, rgba(26, 31, 79, 0.6), rgba(11, 15, 47, 0.8));
          padding: 2.5rem;
          border-radius: 20px;
          border: 1px solid rgba(212, 175, 55, 0.2);
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
        }

        .service-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #D4AF37, #FFD700);
          transform: scaleX(0);
          transition: transform 0.4s ease;
        }

        .service-card:hover::before {
          transform: scaleX(1);
        }

        .service-card:hover {
          transform: translateY(-10px);
          border-color: #D4AF37;
          box-shadow: 0 20px 40px rgba(212, 175, 55, 0.2);
        }

        .service-icon {
          font-size: 3rem;
          margin-bottom: 1.5rem;
          display: block;
        }

        .service-card h3 {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          color: #FFD700;
          margin-bottom: 1rem;
          font-weight: 600;
        }

        .service-card p {
          color: #C0C0C0;
          line-height: 1.7;
          font-size: 0.95rem;
        }

        /* About Section */
        .about-content {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 4rem;
          align-items: center;
        }

        .about-image {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(212, 175, 55, 0.3);
        }

        .about-image::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), transparent);
          z-index: 1;
        }

        .about-image img {
          width: 100%;
          height: auto;
          display: block;
          border-radius: 20px;
        }

        .about-text h3 {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          color: #FFD700;
          margin-bottom: 1rem;
        }

        .about-text h4 {
          color: #D4AF37;
          font-size: 1.2rem;
          margin-bottom: 1.5rem;
          font-weight: 400;
        }

        .about-text p {
          color: #C0C0C0;
          line-height: 1.8;
          margin-bottom: 1.5rem;
          font-size: 1.05rem;
        }

        .expertise-list {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-top: 2rem;
        }

        .expertise-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #E0E0E0;
          font-size: 0.95rem;
        }

        .expertise-item svg {
          color: #FFD700;
          flex-shrink: 0;
        }

        /* Testimonials */
        .testimonials-container {
          max-width: 900px;
          margin: 0 auto;
          position: relative;
        }

        .testimonial {
          background: linear-gradient(145deg, rgba(26, 31, 79, 0.7), rgba(11, 15, 47, 0.9));
          padding: 3rem;
          border-radius: 20px;
          border: 1px solid rgba(212, 175, 55, 0.3);
          text-align: center;
          position: relative;
          animation: fadeIn 0.6s ease-out;
        }

        .testimonial-text {
          font-size: 1.2rem;
          color: #E0E0E0;
          line-height: 1.8;
          margin-bottom: 2rem;
          font-style: italic;
        }

        .testimonial-author {
          font-weight: 600;
          color: #FFD700;
          font-size: 1.1rem;
          margin-bottom: 0.3rem;
        }

        .testimonial-location {
          color: #B0B0B0;
          font-size: 0.9rem;
        }

        .testimonial-stars {
          display: flex;
          justify-content: center;
          gap: 0.3rem;
          margin-top: 1rem;
        }

        .testimonial-stars svg {
          fill: #FFD700;
          color: #FFD700;
        }

        .testimonial-dots {
          display: flex;
          justify-content: center;
          gap: 0.8rem;
          margin-top: 2rem;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(212, 175, 55, 0.3);
          cursor: pointer;
          transition: all 0.3s;
        }

        .dot.active {
          background: #FFD700;
          width: 30px;
          border-radius: 5px;
        }

        /* FAQ */
        .faq-container {
          max-width: 900px;
          margin: 0 auto;
        }

        .faq-item {
          background: linear-gradient(145deg, rgba(26, 31, 79, 0.5), rgba(11, 15, 47, 0.7));
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 15px;
          margin-bottom: 1.5rem;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .faq-item:hover {
          border-color: #D4AF37;
        }

        .faq-question {
          padding: 1.5rem 2rem;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 600;
          color: #FFD700;
          font-size: 1.1rem;
          font-family: 'Playfair Display', serif;
        }

        .faq-question:hover {
          color: #FFF;
        }

        .faq-answer {
          padding: 0 2rem 1.5rem;
          color: #C0C0C0;
          line-height: 1.8;
          font-size: 0.95rem;
        }

        /* Contact */
        .contact-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .contact-item {
          display: flex;
          align-items: flex-start;
          gap: 1.5rem;
          padding: 1.5rem;
          background: linear-gradient(145deg, rgba(26, 31, 79, 0.5), rgba(11, 15, 47, 0.7));
          border-radius: 15px;
          border: 1px solid rgba(212, 175, 55, 0.2);
          transition: all 0.3s ease;
        }

        .contact-item:hover {
          border-color: #D4AF37;
          transform: translateX(5px);
        }

        .contact-item svg {
          color: #FFD700;
          flex-shrink: 0;
          margin-top: 0.2rem;
        }

        .contact-details h3 {
          color: #FFD700;
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
          font-family: 'Playfair Display', serif;
        }

        .contact-details p {
          color: #C0C0C0;
          margin: 0;
        }

        .contact-details a {
          color: #E0E0E0;
          text-decoration: none;
          transition: color 0.3s;
        }

        .contact-details a:hover {
          color: #FFD700;
        }

        .contact-form {
          background: linear-gradient(145deg, rgba(26, 31, 79, 0.5), rgba(11, 15, 47, 0.7));
          padding: 2.5rem;
          border-radius: 20px;
          border: 1px solid rgba(212, 175, 55, 0.2);
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          color: #FFD700;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 1rem;
          background: rgba(11, 15, 47, 0.6);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 10px;
          color: #F5F5F5;
          font-family: 'Poppins', sans-serif;
          font-size: 0.95rem;
          transition: all 0.3s;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: #FFD700;
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.2);
        }

        .form-group select option {
          background: #0B0F2F;
          color: #F5F5F5;
        }

        .form-group textarea {
          resize: vertical;
          min-height: 120px;
        }

        .social-links {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .social-link {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFD700;
          transition: all 0.3s;
          text-decoration: none;
        }

        .social-link:hover {
          background: linear-gradient(135deg, #D4AF37, #FFD700);
          color: #0B0F2F;
          transform: translateY(-3px);
        }

        /* Footer */
        footer {
          background: rgba(11, 15, 47, 0.95);
          padding: 4rem 2rem 2rem;
          border-top: 1px solid rgba(212, 175, 55, 0.2);
        }

        .footer-content {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 3rem;
          margin-bottom: 3rem;
        }

        .footer-section h3 {
          font-family: 'Playfair Display', serif;
          color: #FFD700;
          margin-bottom: 1.5rem;
          font-size: 1.3rem;
        }

        .footer-section p,
        .footer-section a {
          color: #C0C0C0;
          line-height: 1.8;
          text-decoration: none;
          display: block;
          margin-bottom: 0.5rem;
          transition: color 0.3s;
        }

        .footer-section a:hover {
          color: #FFD700;
        }

        .footer-bottom {
          text-align: center;
          padding-top: 2rem;
          border-top: 1px solid rgba(212, 175, 55, 0.1);
          color: #B0B0B0;
          font-size: 0.9rem;
        }

        /* WhatsApp Float Button */
        .whatsapp-float {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 65px;
          height: 65px;
          background: linear-gradient(135deg, #25D366, #128C7E);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 32px;
          box-shadow: 0 4px 20px rgba(37, 211, 102, 0.5);
          z-index: 1000;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          animation: whatsappGlow 3s infinite;
        }

        .whatsapp-float:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 30px rgba(37, 211, 102, 0.7);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .menu-toggle {
            display: block;
          }

          nav {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(11, 15, 47, 0.98);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            transform: translateX(100%);
            transition: transform 0.3s ease;
          }

          nav.open {
            transform: translateX(0);
          }

          nav ul {
            flex-direction: column;
            gap: 2rem;
            font-size: 1.3rem;
          }

          .about-content {
            grid-template-columns: 1fr;
          }

          .contact-grid {
            grid-template-columns: 1fr;
          }

          .expertise-list {
            grid-template-columns: 1fr;
          }

          .services-grid {
            grid-template-columns: 1fr;
          }

          .whatsapp-float {
            width: 55px;
            height: 55px;
            font-size: 28px;
            bottom: 20px;
            right: 20px;
          }
        }

        /* Booking Section */
        .booking-section {
          background: linear-gradient(145deg, rgba(26, 31, 79, 0.5), rgba(11, 15, 47, 0.7));
          padding: 4rem 2rem;
          border-radius: 30px;
          max-width: 1000px;
          margin: 0 auto;
          border: 1px solid rgba(212, 175, 55, 0.3);
          text-align: center;
        }

        .booking-section h2 {
          font-family: 'Playfair Display', serif;
          font-size: 2.5rem;
          color: #FFD700;
          margin-bottom: 1rem;
        }

        .booking-section p {
          color: #C0C0C0;
          font-size: 1.1rem;
          margin-bottom: 2rem;
        }

        .slots-notice {
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid #D4AF37;
          border-radius: 10px;
          padding: 1rem;
          color: #FFD700;
          font-weight: 500;
          margin-bottom: 2rem;
          display: inline-block;
        }

        /* SEO Meta Tags (for reference) */
        .seo-hidden {
          display: none;
        }

        /* AI Guidance Section */
        .guidance-section {
          background: linear-gradient(145deg, rgba(26, 31, 79, 0.4), rgba(11, 15, 47, 0.6));
          border: 1px solid rgba(212, 175, 55, 0.25);
          border-radius: 30px;
          padding: 3.5rem;
          max-width: 900px;
          margin: 0 auto;
          position: relative;
          overflow: hidden;
        }

        .guidance-section::before {
          content: '🔮';
          position: absolute;
          font-size: 12rem;
          opacity: 0.04;
          right: -2rem;
          top: -2rem;
          pointer-events: none;
        }

        .guidance-orb-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, rgba(212,175,55,0.15), rgba(255,215,0,0.1));
          border: 1px solid rgba(212,175,55,0.4);
          border-radius: 50px;
          padding: 0.4rem 1.2rem;
          font-size: 0.8rem;
          color: #FFD700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin-bottom: 1.5rem;
        }

        .guidance-textarea {
          width: 100%;
          min-height: 130px;
          padding: 1.2rem 1.5rem;
          background: rgba(11, 15, 47, 0.7);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 16px;
          color: #F5F5F5;
          font-family: 'Poppins', sans-serif;
          font-size: 1rem;
          resize: vertical;
          transition: all 0.3s ease;
          line-height: 1.6;
        }

        .guidance-textarea:focus {
          outline: none;
          border-color: #FFD700;
          box-shadow: 0 0 25px rgba(212, 175, 55, 0.15);
        }

        .guidance-textarea::placeholder {
          color: rgba(255,255,255,0.3);
        }

        .guidance-examples {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
          margin: 1.2rem 0 1.5rem;
        }

        .guidance-example-chip {
          background: rgba(212, 175, 55, 0.08);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 50px;
          padding: 0.35rem 0.9rem;
          font-size: 0.8rem;
          color: #D4AF37;
          cursor: pointer;
          transition: all 0.25s ease;
          white-space: nowrap;
        }

        .guidance-example-chip:hover {
          background: rgba(212, 175, 55, 0.18);
          border-color: #D4AF37;
          color: #FFD700;
          transform: translateY(-1px);
        }

        .guidance-submit-btn {
          width: 100%;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #D4AF37, #FFD700);
          color: #0B0F2F;
          border: none;
          border-radius: 50px;
          font-size: 1.05rem;
          font-weight: 700;
          font-family: 'Poppins', sans-serif;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          animation: buttonGlow 3s infinite;
        }

        .guidance-submit-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(212, 175, 55, 0.4);
        }

        .guidance-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          animation: none;
          transform: none;
        }

        @keyframes spinStar {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .loading-star {
          display: inline-block;
          animation: spinStar 1s linear infinite;
        }

        .guidance-response-box {
          margin-top: 2rem;
          background: linear-gradient(145deg, rgba(212,175,55,0.06), rgba(11,15,47,0.7));
          border: 1px solid rgba(212, 175, 55, 0.35);
          border-radius: 20px;
          padding: 2rem;
          animation: fadeInUp 0.5s ease-out;
        }

        .guidance-response-header {
          display: flex;
          align-items: center;
          gap: 0.7rem;
          margin-bottom: 1.2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(212,175,55,0.15);
        }

        .guidance-response-header span {
          font-family: 'Playfair Display', serif;
          font-size: 1.15rem;
          color: #FFD700;
          font-weight: 600;
        }

        .guidance-response-text {
          color: #DCDCDC;
          line-height: 1.9;
          font-size: 1rem;
          white-space: pre-wrap;
        }

        .guidance-response-cta {
          margin-top: 1.5rem;
          padding-top: 1.2rem;
          border-top: 1px solid rgba(212,175,55,0.15);
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .guidance-error-box {
          margin-top: 1.5rem;
          background: rgba(255, 100, 100, 0.08);
          border: 1px solid rgba(255, 100, 100, 0.3);
          border-radius: 14px;
          padding: 1rem 1.5rem;
          color: #ff8080;
          font-size: 0.95rem;
        }

        .char-counter {
          text-align: right;
          font-size: 0.78rem;
          color: rgba(255,255,255,0.3);
          margin-top: 0.4rem;
        }

        /* Lead Gate Modal */
        .lead-overlay {
          position: fixed;
          inset: 0;
          background: rgba(6, 8, 30, 0.88);
          backdrop-filter: blur(8px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          animation: fadeIn 0.25s ease-out;
        }

        .lead-modal {
          background: linear-gradient(160deg, #111638, #0B0F2F);
          border: 1px solid rgba(212,175,55,0.4);
          border-radius: 24px;
          padding: 2.8rem 2.5rem;
          width: 100%;
          max-width: 460px;
          position: relative;
          box-shadow: 0 30px 80px rgba(0,0,0,0.6), 0 0 60px rgba(212,175,55,0.08);
          animation: fadeInUp 0.35s ease-out;
        }

        .lead-modal-icon {
          font-size: 3rem;
          text-align: center;
          display: block;
          margin-bottom: 1rem;
        }

        .lead-modal h2 {
          font-family: 'Playfair Display', serif;
          font-size: 1.7rem;
          color: #FFD700;
          text-align: center;
          margin-bottom: 0.5rem;
        }

        .lead-modal-sub {
          text-align: center;
          color: #A0A0B0;
          font-size: 0.92rem;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .lead-modal-sub strong {
          color: #D4AF37;
        }

        .lead-input-group {
          margin-bottom: 1.2rem;
        }

        .lead-input-group label {
          display: block;
          color: #D4AF37;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          letter-spacing: 0.5px;
        }

        .lead-input-group input {
          width: 100%;
          padding: 0.9rem 1.1rem;
          background: rgba(11,15,47,0.8);
          border: 1px solid rgba(212,175,55,0.3);
          border-radius: 12px;
          color: #F5F5F5;
          font-family: 'Poppins', sans-serif;
          font-size: 0.98rem;
          transition: all 0.25s;
        }

        .lead-input-group input:focus {
          outline: none;
          border-color: #FFD700;
          box-shadow: 0 0 20px rgba(212,175,55,0.15);
        }

        .lead-input-group input::placeholder {
          color: rgba(255,255,255,0.25);
        }

        .lead-submit-btn {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #D4AF37, #FFD700);
          color: #0B0F2F;
          border: none;
          border-radius: 50px;
          font-size: 1rem;
          font-weight: 700;
          font-family: 'Poppins', sans-serif;
          cursor: pointer;
          margin-top: 0.5rem;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          animation: buttonGlow 3s infinite;
        }

        .lead-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(212,175,55,0.4);
        }

        .lead-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          animation: none;
          transform: none;
        }

        .lead-error {
          background: rgba(255,100,100,0.1);
          border: 1px solid rgba(255,100,100,0.3);
          border-radius: 10px;
          padding: 0.7rem 1rem;
          color: #ff8080;
          font-size: 0.85rem;
          margin-top: 1rem;
          text-align: center;
        }

        .lead-privacy {
          text-align: center;
          color: rgba(255,255,255,0.3);
          font-size: 0.75rem;
          margin-top: 1.2rem;
          line-height: 1.5;
        }

        .lead-privacy span { color: #D4AF37; }

        .lead-unlocked-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(37,211,102,0.1);
          border: 1px solid rgba(37,211,102,0.3);
          border-radius: 50px;
          padding: 0.3rem 0.9rem;
          font-size: 0.78rem;
          color: #25D366;
          margin-bottom: 1.2rem;
        }

        /* Palm Scanner Section */
        .palm-section-wrap {
          max-width: 950px;
          margin: 0 auto;
          background: linear-gradient(145deg, rgba(26,31,79,0.4), rgba(11,15,47,0.7));
          border: 1px solid rgba(212,175,55,0.25);
          border-radius: 30px;
          padding: 3.5rem;
          position: relative;
          overflow: hidden;
        }

        .palm-section-wrap::after {
          content: '';
          position: absolute;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%);
          top: -80px;
          right: -80px;
          pointer-events: none;
        }

        .palm-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, rgba(212,175,55,0.15), rgba(255,215,0,0.08));
          border: 1px solid rgba(212,175,55,0.4);
          border-radius: 50px;
          padding: 0.4rem 1.2rem;
          font-size: 0.78rem;
          color: #FFD700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin-bottom: 1.8rem;
        }

        .palm-style-row {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .palm-style-btn {
          flex: 1;
          min-width: 120px;
          padding: 0.8rem 1rem;
          background: rgba(11,15,47,0.6);
          border: 1px solid rgba(212,175,55,0.2);
          border-radius: 14px;
          color: #C0C0C0;
          cursor: pointer;
          transition: all 0.25s ease;
          text-align: center;
          font-family: 'Poppins', sans-serif;
          font-size: 0.9rem;
        }

        .palm-style-btn.active {
          background: rgba(212,175,55,0.12);
          border-color: #D4AF37;
          color: #FFD700;
        }

        .palm-style-btn:hover {
          border-color: rgba(212,175,55,0.5);
          color: #FFD700;
        }

        .palm-style-label { font-weight: 600; display: block; }
        .palm-style-desc { font-size: 0.72rem; opacity: 0.7; margin-top: 0.15rem; display: block; }

        .palm-drop-zone {
          border: 2px dashed rgba(212,175,55,0.35);
          border-radius: 20px;
          padding: 3rem 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: rgba(11,15,47,0.4);
          position: relative;
        }

        .palm-drop-zone.drag-active {
          border-color: #FFD700;
          background: rgba(212,175,55,0.08);
          transform: scale(1.01);
        }

        .palm-drop-zone:hover {
          border-color: rgba(212,175,55,0.6);
          background: rgba(212,175,55,0.05);
        }

        .palm-drop-zone input[type="file"] {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
          width: 100%;
          height: 100%;
        }

        .palm-drop-icon { font-size: 3.5rem; margin-bottom: 1rem; display: block; }
        .palm-drop-text { color: #D4AF37; font-size: 1.05rem; font-weight: 500; margin-bottom: 0.4rem; }
        .palm-drop-hint { color: rgba(255,255,255,0.35); font-size: 0.82rem; }

        .palm-preview-wrap {
          margin-top: 1.5rem;
          position: relative;
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid rgba(212,175,55,0.3);
          max-height: 320px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(11,15,47,0.5);
        }

        .palm-preview-wrap img {
          max-width: 100%;
          max-height: 320px;
          object-fit: contain;
          display: block;
        }

        .palm-change-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(11,15,47,0.85);
          border: 1px solid rgba(212,175,55,0.4);
          border-radius: 8px;
          color: #D4AF37;
          padding: 0.35rem 0.8rem;
          font-size: 0.78rem;
          cursor: pointer;
          font-family: 'Poppins', sans-serif;
          transition: all 0.2s;
        }

        .palm-change-btn:hover { background: rgba(212,175,55,0.15); }

        .palm-scan-btn {
          width: 100%;
          margin-top: 1.5rem;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #D4AF37, #FFD700);
          color: #0B0F2F;
          border: none;
          border-radius: 50px;
          font-size: 1.05rem;
          font-weight: 700;
          font-family: 'Poppins', sans-serif;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          animation: buttonGlow 3s infinite;
        }

        .palm-scan-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(212,175,55,0.4);
        }

        .palm-scan-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          animation: none;
          transform: none;
        }

        .palm-reading-box {
          margin-top: 2rem;
          background: linear-gradient(145deg, rgba(212,175,55,0.06), rgba(11,15,47,0.7));
          border: 1px solid rgba(212,175,55,0.35);
          border-radius: 20px;
          padding: 2rem;
          animation: fadeInUp 0.5s ease-out;
        }

        .palm-reading-header {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          margin-bottom: 1.2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(212,175,55,0.15);
        }

        .palm-reading-header span { font-family: 'Playfair Display', serif; font-size: 1.15rem; color: #FFD700; font-weight: 600; }

        .palm-reading-text {
          color: #DCDCDC;
          line-height: 1.95;
          font-size: 1rem;
          white-space: pre-wrap;
        }

        .palm-reading-cta {
          margin-top: 1.5rem;
          padding-top: 1.2rem;
          border-top: 1px solid rgba(212,175,55,0.15);
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .palm-tips {
          margin-top: 1.5rem;
          background: rgba(212,175,55,0.06);
          border: 1px solid rgba(212,175,55,0.15);
          border-radius: 14px;
          padding: 1rem 1.4rem;
        }

        .palm-tips h4 { color: #D4AF37; font-size: 0.9rem; margin-bottom: 0.6rem; }
        .palm-tips ul { list-style: none; padding: 0; }
        .palm-tips ul li { color: rgba(255,255,255,0.55); font-size: 0.82rem; padding: 0.2rem 0; }
        .palm-tips ul li::before { content: '✦ '; color: #D4AF37; }

        /* Usage counter badge */
        .usage-counter {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(212,175,55,0.1);
          border: 1px solid rgba(212,175,55,0.3);
          border-radius: 50px;
          padding: 0.35rem 1rem;
          font-size: 0.82rem;
          color: #D4AF37;
          margin-bottom: 1.2rem;
        }

        .usage-counter.last-use {
          background: rgba(255,150,50,0.1);
          border-color: rgba(255,150,50,0.4);
          color: #ffaa55;
        }

        .usage-counter.used-up {
          background: rgba(255,80,80,0.1);
          border-color: rgba(255,80,80,0.35);
          color: #ff8080;
        }

        /* Limit reached modal */
        .limit-modal-icon { font-size: 3rem; text-align: center; display: block; margin-bottom: 1rem; }

        .limit-modal h2 {
          font-family: 'Playfair Display', serif;
          font-size: 1.6rem;
          color: #FFD700;
          text-align: center;
          margin-bottom: 0.6rem;
        }

        .limit-modal-sub {
          text-align: center;
          color: #A0A0B0;
          font-size: 0.92rem;
          margin-bottom: 1.8rem;
          line-height: 1.7;
        }

        .limit-modal-sub strong { color: #D4AF37; }

        .limit-modal .cta-buttons {
          flex-direction: column;
          gap: 0.8rem;
        }

        .limit-modal .cta-buttons a,
        .limit-modal .cta-buttons button {
          width: 100%;
          justify-content: center;
        }

        /* Inline lead capture form */
        .inline-lead-form {
          margin-bottom: 1.5rem;
          padding: 1.2rem 1.4rem;
          background: rgba(212,175,55,0.07);
          border: 1px solid rgba(212,175,55,0.25);
          border-radius: 14px;
        }

        .inline-lead-inputs {
          display: flex;
          gap: 0.8rem;
          flex-wrap: wrap;
          align-items: center;
        }

        .inline-lead-input {
          flex: 1;
          min-width: 160px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(212,175,55,0.3);
          border-radius: 8px;
          padding: 0.65rem 1rem;
          color: #F5F5F5;
          font-family: 'Poppins', sans-serif;
          font-size: 0.9rem;
        }

        .inline-lead-input::placeholder { color: rgba(255,255,255,0.35); }
        .inline-lead-input:focus { outline: none; border-color: #D4AF37; }

        .inline-lead-btn {
          background: linear-gradient(135deg, #D4AF37, #FFD700);
          color: #0B0F2F;
          border: none;
          border-radius: 8px;
          padding: 0.65rem 1.4rem;
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          white-space: nowrap;
          transition: opacity 0.2s;
        }

        .inline-lead-btn:hover { opacity: 0.88; }
        .inline-lead-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .inline-lead-note {
          margin-top: 0.7rem;
          font-size: 0.78rem;
          color: rgba(255,255,255,0.45);
        }

        .inline-lead-error {
          margin-top: 0.5rem;
          font-size: 0.82rem;
          color: #ff8080;
        }
      `}</style>

      {/* SEO Meta Information */}
      <div className="seo-hidden">
        <h1>Best Astrologer in India - Ruchi Bhardwaj | Dia Astro</h1>
        <h2>Share Market Astrology, Marriage Prediction, Career Astrology</h2>
        <p>Consult India's leading Vedic astrologer Ruchi Bhardwaj for accurate predictions on career, love, marriage, business, share market, legal cases, and karma dosh analysis. Expert birth chart analysis and muhurat selection.</p>
      </div>

      {/* Cosmic Background */}
      <div className="cosmic-bg">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className={scrolled ? 'scrolled' : ''}>
        <div className="header-content">
          <a href="#home" className="logo">
            <div className="logo-icon">
              <svg viewBox="0 0 100 100" width="50" height="50">
                <circle cx="50" cy="50" r="45" fill="url(#logoGradient)" opacity="0.2"/>
                <circle cx="50" cy="50" r="35" fill="url(#logoGradient)" opacity="0.3"/>
                <path d="M50 15 L54 35 L75 35 L58 48 L65 68 L50 55 L35 68 L42 48 L25 35 L46 35 Z" 
                      fill="url(#logoGradient)" 
                      stroke="#FFD700" 
                      strokeWidth="1"/>
                <line x1="50" y1="10" x2="50" y2="2" stroke="#FFD700" strokeWidth="2" opacity="0.8"/>
                <line x1="50" y1="90" x2="50" y2="98" stroke="#FFD700" strokeWidth="2" opacity="0.8"/>
                <line x1="10" y1="50" x2="2" y2="50" stroke="#FFD700" strokeWidth="2" opacity="0.8"/>
                <line x1="90" y1="50" x2="98" y2="50" stroke="#FFD700" strokeWidth="2" opacity="0.8"/>
                <line x1="20" y1="20" x2="14" y2="14" stroke="#FFD700" strokeWidth="1.5" opacity="0.6"/>
                <line x1="80" y1="80" x2="86" y2="86" stroke="#FFD700" strokeWidth="1.5" opacity="0.6"/>
                <line x1="80" y1="20" x2="86" y2="14" stroke="#FFD700" strokeWidth="1.5" opacity="0.6"/>
                <line x1="20" y1="80" x2="14" y2="86" stroke="#FFD700" strokeWidth="1.5" opacity="0.6"/>
                <circle cx="30" cy="30" r="1.5" fill="#FFD700" opacity="0.8"/>
                <circle cx="70" cy="30" r="1.5" fill="#FFD700" opacity="0.8"/>
                <circle cx="30" cy="70" r="1.5" fill="#FFD700" opacity="0.8"/>
                <circle cx="70" cy="70" r="1.5" fill="#FFD700" opacity="0.8"/>
                <defs>
                  <radialGradient id="logoGradient" cx="50%" cy="50%">
                    <stop offset="0%" stopColor="#FFD700" stopOpacity="1"/>
                    <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.8"/>
                  </radialGradient>
                </defs>
              </svg>
            </div>
            <div className="logo-text">
              <h1>Dia Astro</h1>
              <p>VEDIC WISDOM</p>
            </div>
          </a>
          
          <nav className={isMenuOpen ? 'open' : ''}>
            <ul>
              <li><button className="nav-link" onClick={() => scrollToSection('home')}>Home</button></li>
              <li><button className="nav-link" onClick={() => scrollToSection('services')}>Services</button></li>
              <li><button className="nav-link" onClick={() => scrollToSection('palm')}>Palm Reading</button></li>
              <li><button className="nav-link" onClick={() => scrollToSection('guidance')}>AI Guidance</button></li>
              <li><button className="nav-link" onClick={() => scrollToSection('about')}>About</button></li>
              <li><button className="nav-link" onClick={() => scrollToSection('testimonials')}>Testimonials</button></li>
              <li><button className="nav-link" onClick={() => scrollToSection('contact')}>Contact</button></li>
            </ul>
          </nav>

          <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-content">
          <h1>Find Clarity in Career, Love, Business & Destiny</h1>
          <p className="hero-subtitle">
            Consult Astrologer Ruchi Bhardwaj for accurate predictions and powerful analysis
          </p>
          <div className="hero-highlight">
            <span className="hero-highlight-icon">✨</span>
            No costly gemstones or rituals recommended — learn powerful manifestation, gratitude, visualization, and mindful intention practices as part of your consultation.
          </div>
          <div className="cta-buttons">
            <a href="https://wa.me/918625815099" className="btn btn-primary" target="_blank" rel="noopener noreferrer">
              <MessageCircle size={20} />
              Chat on WhatsApp
            </a>
            <button onClick={() => scrollToSection('booking')} className="btn btn-secondary">
              <Calendar size={20} />
              Book Appointment
            </button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services">
        <h2 className="section-title">Our Services</h2>
        <p className="section-subtitle">
          Comprehensive Vedic astrology guidance for all aspects of your life
        </p>
        <div className="services-grid">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="service-card"
              style={{
                animationDelay: `${index * 0.1}s`,
                animation: 'fadeInUp 0.6s ease-out forwards',
                opacity: 0
              }}
            >
              <span className="service-icon">{service.icon}</span>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Palm Scanner Section */}
      <section id="palm">
        <h2 className="section-title">🖐 AI Palm Reading</h2>
        <p className="section-subtitle">
          Upload a clear photo of your palm and receive an instant reading powered by Vedic palmistry wisdom
        </p>
        <div className="palm-section-wrap">
          <div className="palm-badge">✦ AI Powered · Vedic Palmistry · Instant Reading</div>

          {/* Inline lead capture — shown until submitted */}
          {!leadSubmitted && (
            <div className="inline-lead-form">
              <div className="inline-lead-inputs">
                <input
                  type="text"
                  className="inline-lead-input"
                  placeholder="Your Name"
                  value={inlineName}
                  onChange={(e) => setInlineName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitInlineLead('palm')}
                />
                <input
                  type="tel"
                  className="inline-lead-input"
                  placeholder="Phone Number"
                  value={inlinePhone}
                  onChange={(e) => setInlinePhone(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitInlineLead('palm')}
                  maxLength={15}
                />
                <button
                  className="inline-lead-btn"
                  onClick={() => submitInlineLead('palm')}
                >
                  Continue
                </button>
              </div>
              {inlineError && <p className="inline-lead-error">⚠️ {inlineError}</p>}
              <p className="inline-lead-note">We capture your Name and Phone Number for future campaign communication.</p>
            </div>
          )}

          {/* Per-feature usage counter — shown after lead submitted */}
          {leadSubmitted && palmUsageCount < FEATURE_LIMIT && (
            <div className={`usage-counter${palmUsageCount === FEATURE_LIMIT - 1 ? ' last-use' : ''}`}>
              ✦ {FEATURE_LIMIT - palmUsageCount} free {FEATURE_LIMIT - palmUsageCount === 1 ? 'use' : 'uses'} remaining
            </div>
          )}
          {leadSubmitted && palmUsageCount >= FEATURE_LIMIT && (
            <div className="usage-counter used-up">
              ✦ You have reached the maximum free usage limit. Please contact us to continue.
            </div>
          )}

          {/* Style selector */}
          <div className="palm-style-row">
            {palmStyles.map(s => (
              <button
                key={s.id}
                className={`palm-style-btn${palmStyle === s.id ? ' active' : ''}`}
                onClick={() => setPalmStyle(s.id)}
              >
                <span className="palm-style-label">{s.label}</span>
                <span className="palm-style-desc">{s.desc}</span>
              </button>
            ))}
          </div>

          {/* Upload zone */}
          {!palmPreview ? (
            <div
              className={`palm-drop-zone${dragOver ? ' drag-active' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handlePalmFile(e.dataTransfer.files[0]); }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handlePalmFile(e.target.files[0])}
              />
              <span className="palm-drop-icon">🖐</span>
              <p className="palm-drop-text">Upload your palm photo</p>
              <p className="palm-drop-hint">Drag & drop or click to browse · JPG, PNG up to 5MB</p>
            </div>
          ) : (
            <div className="palm-preview-wrap">
              <img src={palmPreview} alt="Your palm" />
              <button
                className="palm-change-btn"
                onClick={() => { setPalmPreview(null); setPalmImage(null); setPalmReading(''); setPalmError(''); }}
              >
                ✕ Change
              </button>
            </div>
          )}

          {/* Photo tips */}
          <div className="palm-tips">
            <h4>📸 Tips for best results:</h4>
            <ul>
              <li>Use good lighting — natural daylight works best</li>
              <li>Keep your palm flat and fully open</li>
              <li>Use your dominant hand (right for right-handed)</li>
              <li>Make sure the entire palm is visible in the frame</li>
            </ul>
          </div>

          {/* Scan button */}
          <button
            className="palm-scan-btn"
            onClick={scanPalm}
            disabled={!palmImage || palmLoading || !leadSubmitted || palmUsageCount >= FEATURE_LIMIT}
          >
            {palmLoading ? (
              <><span className="loading-star">✦</span> Reading Your Palm Lines...</>
            ) : palmUsageCount >= FEATURE_LIMIT ? (
              <>🔒 Free Limit Reached</>
            ) : (
              <>🔮 Scan My Palm</>
            )}
          </button>

          {palmError && (
            <div className="guidance-error-box">⚠️ {palmError}</div>
          )}

          {palmReading && (
            <div className="palm-reading-box">
              <div className="palm-reading-header">
                <span>🖐</span>
                <span>Your Palm Reading</span>
              </div>
              <div className="palm-reading-text">{palmReading}</div>
              <div className="palm-reading-cta">
                <a
                  href="https://wa.me/918625815099?text=Hi, I would like a detailed palm reading consultation"
                  className="btn btn-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ padding: '0.7rem 1.8rem', fontSize: '0.95rem' }}
                >
                  <MessageCircle size={16} />
                  Book Full Consultation
                </a>
                <button
                  className="btn btn-secondary"
                  onClick={() => { setPalmReading(''); setPalmPreview(null); setPalmImage(null); setPalmError(''); }}
                  style={{ padding: '0.7rem 1.8rem', fontSize: '0.95rem' }}
                >
                  Scan Another Palm
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* AI Astrology Guidance Section */}
      <section id="guidance">
        <h2 className="section-title">✨ AI Astrology Guidance</h2>
        <p className="section-subtitle">
          Ask any astrology question and receive instant cosmic wisdom powered by Vedic knowledge
        </p>
        <div className="guidance-section">
          <div className="guidance-orb-badge">
            ⭐ Powered by Gemini AI · Vedic Astrology
          </div>

          {/* Inline lead capture — shown until submitted */}
          {!leadSubmitted && (
            <div className="inline-lead-form">
              <div className="inline-lead-inputs">
                <input
                  type="text"
                  className="inline-lead-input"
                  placeholder="Your Name"
                  value={inlineName}
                  onChange={(e) => setInlineName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitInlineLead('guidance')}
                />
                <input
                  type="tel"
                  className="inline-lead-input"
                  placeholder="Phone Number"
                  value={inlinePhone}
                  onChange={(e) => setInlinePhone(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitInlineLead('guidance')}
                  maxLength={15}
                />
                <button
                  className="inline-lead-btn"
                  onClick={() => submitInlineLead('guidance')}
                >
                  Continue
                </button>
              </div>
              {inlineError && <p className="inline-lead-error">⚠️ {inlineError}</p>}
              <p className="inline-lead-note">We capture your Name and Phone Number for future campaign communication.</p>
            </div>
          )}

          {/* Per-feature usage counter — shown after lead submitted */}
          {leadSubmitted && guidanceUsageCount < FEATURE_LIMIT && (
            <div className={`usage-counter${guidanceUsageCount === FEATURE_LIMIT - 1 ? ' last-use' : ''}`}>
              ✦ {FEATURE_LIMIT - guidanceUsageCount} free {FEATURE_LIMIT - guidanceUsageCount === 1 ? 'use' : 'uses'} remaining
            </div>
          )}
          {leadSubmitted && guidanceUsageCount >= FEATURE_LIMIT && (
            <div className="usage-counter used-up">
              ✦ You have reached the maximum free usage limit. Please contact us to continue.
            </div>
          )}

          <textarea
            className="guidance-textarea"
            placeholder="Ask your astrology question... e.g. 'I was born on 4th January 1982 at 8 AM in Delhi. What does my chart say about my career?' Be specific for better guidance!"
            value={guidanceQuestion}
            onChange={(e) => setGuidanceQuestion(e.target.value.slice(0, 500))}
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) askGuidance(); }}
          />
          <div className="char-counter">{guidanceQuestion.length}/500</div>

          <div className="guidance-examples">
            {exampleQuestions.map((q, i) => (
              <span
                key={i}
                className="guidance-example-chip"
                onClick={() => setGuidanceQuestion(q)}
              >
                {q}
              </span>
            ))}
          </div>

          <button
            className="guidance-submit-btn"
            onClick={askGuidance}
            disabled={guidanceLoading || !guidanceQuestion.trim() || !leadSubmitted || guidanceUsageCount >= FEATURE_LIMIT}
          >
            {guidanceLoading ? (
              <>
                <span className="loading-star">✦</span>
                Consulting the Stars...
              </>
            ) : guidanceUsageCount >= FEATURE_LIMIT ? (
              <>🔒 Free Limit Reached</>
            ) : (
              <>🔮 Get Astrology Guidance</>
            )}
          </button>

          {guidanceError && (
            <div className="guidance-error-box">
              ⚠️ {guidanceError}
            </div>
          )}

          {guidanceResponse && (
            <div className="guidance-response-box">
              <div className="guidance-response-header">
                <span>🌟</span>
                <span>Your Cosmic Guidance</span>
              </div>
              <div className="guidance-response-text">{guidanceResponse}</div>
              <div className="guidance-response-cta">
                <a
                  href="https://wa.me/918625815099?text=Hi, I would like a detailed consultation"
                  className="btn btn-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ padding: '0.7rem 1.8rem', fontSize: '0.95rem' }}
                >
                  <MessageCircle size={16} />
                  Book Full Consultation
                </a>
                <button
                  className="btn btn-secondary"
                  onClick={() => { setGuidanceResponse(''); setGuidanceQuestion(''); setGuidanceError(''); }}
                  style={{ padding: '0.7rem 1.8rem', fontSize: '0.95rem' }}
                >
                  Ask Another Question
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about">
        <h2 className="section-title">About Ruchi Bhardwaj</h2>
        <p className="section-subtitle">
          Your trusted guide to cosmic wisdom and spiritual clarity
        </p>
        <div className="about-content">
          <div className="about-image">
            <img src="/Ruchi_Bhardwaj.jpeg" alt="Astrologer Ruchi Bhardwaj - Best Astrologer in India" />
          </div>
          <div className="about-text">
            <h3>Ruchi Bhardwaj</h3>
            <h4>Vedic Astrologer & Spiritual Guide</h4>
            <p>
              With deep knowledge of Vedic astrology and years of experience guiding thousands of clients, 
              Ruchi Bhardwaj combines ancient wisdom with modern understanding to provide accurate predictions 
              and practical analysis.
            </p>
            <p>
              Her unique approach blends spiritual insight with analytical precision, offering clarity on 
              career decisions, relationships, business ventures, financial investments, and life's most 
              important choices. Known for her compassionate guidance and accurate timing predictions, 
              she has helped countless individuals transform their lives.
            </p>
            <div className="expertise-list">
              <div className="expertise-item">
                <Star size={18} fill="#FFD700" />
                <span>Birth Chart Analysis</span>
              </div>
              <div className="expertise-item">
                <Star size={18} fill="#FFD700" />
                <span>Share Market Timing</span>
              </div>
              <div className="expertise-item">
                <Star size={18} fill="#FFD700" />
                <span>Marriage Compatibility</span>
              </div>
              <div className="expertise-item">
                <Star size={18} fill="#FFD700" />
                <span>Career Guidance</span>
              </div>
              <div className="expertise-item">
                <Star size={18} fill="#FFD700" />
                <span>Karma Dosh Analysis</span>
              </div>
              <div className="expertise-item">
                <Star size={18} fill="#FFD700" />
                <span>Muhurat Selection</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section id="booking">
        <div className="booking-section">
          <h2>Book Your Consultation</h2>
          <p>Get personalized guidance from Ruchi Bhardwaj</p>
          <div className="slots-notice">
            ⏰ Limited slots available - Book your session today
          </div>
          <div className="cta-buttons">
            <a href="https://wa.me/918625815099?text=Hi, I would like to book an astrology consultation" 
               className="btn btn-primary" 
               target="_blank" 
               rel="noopener noreferrer">
              <MessageCircle size={20} />
              Book via WhatsApp
            </a>
            <a href="tel:+918625815099" className="btn btn-secondary">
              <Phone size={20} />
              Call Now
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials">
        <h2 className="section-title">Client Testimonials</h2>
        <p className="section-subtitle">
          Hear from those whose lives have been transformed
        </p>
        <div className="testimonials-container">
          <div className="testimonial">
            <p className="testimonial-text">"{testimonials[currentTestimonial].text}"</p>
            <div className="testimonial-stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} fill="#FFD700" />
              ))}
            </div>
            <p className="testimonial-author">{testimonials[currentTestimonial].name}</p>
            <p className="testimonial-location">{testimonials[currentTestimonial].location}</p>
          </div>
          <div className="testimonial-dots">
            {testimonials.map((_, index) => (
              <div
                key={index}
                className={`dot ${index === currentTestimonial ? 'active' : ''}`}
                onClick={() => setCurrentTestimonial(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <p className="section-subtitle">
          Everything you need to know about Vedic astrology
        </p>
        <div className="faq-container">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact">
        <h2 className="section-title">Get In Touch</h2>
        <p className="section-subtitle">
          Ready to unlock your cosmic potential? Reach out today
        </p>
        <div className="contact-grid">
          <div className="contact-info">
            <div className="contact-item">
              <Phone size={24} />
              <div className="contact-details">
                <h3>Phone</h3>
                <p><a href="tel:+918625815099">+91 8625815099</a></p>
              </div>
            </div>
            <div className="contact-item">
              <Mail size={24} />
              <div className="contact-details">
                <h3>Email</h3>
                <p><a href="mailto:ruchi.bhardwaj@diaastro.in">ruchi.bhardwaj@diaastro.in</a></p>
              </div>
            </div>
            <div className="contact-item">
              <MapPin size={24} />
              <div className="contact-details">
                <h3>Location</h3>
                <p>Serving clients across India and worldwide</p>
              </div>
            </div>
            <div className="social-links">
              <a href="https://facebook.com" className="social-link" target="_blank" rel="noopener noreferrer">
                <Facebook size={20} />
              </a>
              <a href="https://instagram.com" className="social-link" target="_blank" rel="noopener noreferrer">
                <Instagram size={20} />
              </a>
              <a href="https://twitter.com" className="social-link" target="_blank" rel="noopener noreferrer">
                <Twitter size={20} />
              </a>
              <a href="https://linkedin.com" className="social-link" target="_blank" rel="noopener noreferrer">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          <div className="contact-form">
            <div style={{
              background: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '10px',
              padding: '1rem',
              marginBottom: '1.5rem',
              fontSize: '0.9rem',
              color: '#E0E0E0'
            }}>
              <strong style={{ color: '#FFD700' }}>📋 Important:</strong> Accurate birth details (date, time, place) are essential for precise astrological predictions. If birth time is unknown, mention it in the message.
            </div>
            <form onSubmit={(e) => { e.preventDefault(); alert('Form submitted! We will contact you soon.'); }}>
              <div className="form-group">
                <label htmlFor="name">Your Name *</label>
                <input type="text" id="name" required placeholder="Enter your full name" />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input type="email" id="email" required placeholder="your.email@example.com" />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone *</label>
                <input type="tel" id="phone" required placeholder="+91 XXXXX XXXXX" />
              </div>
              <div className="form-group">
                <label htmlFor="dob">Date of Birth *</label>
                <input type="date" id="dob" required />
              </div>
              <div className="form-group">
                <label htmlFor="tob">Time of Birth *</label>
                <input type="time" id="tob" required />
              </div>
              <div className="form-group">
                <label htmlFor="pob">Place of Birth *</label>
                <input type="text" id="pob" required placeholder="City, State, Country" />
              </div>
              <div className="form-group">
                <label htmlFor="consultation">Consultation Type *</label>
                <select id="consultation" required>
                  <option value="">Select service...</option>
                  <option value="career">Career & Job Security</option>
                  <option value="sharemarket">Share Market & Business</option>
                  <option value="love">Love & Marriage</option>
                  <option value="compatibility">Marriage Compatibility</option>
                  <option value="health">Health & Wealth</option>
                  <option value="birthchart">Birth Chart Analysis</option>
                  <option value="legal">Legal Case Astrology</option>
                  <option value="karma">Karma Dosh Analysis</option>
                  <option value="muhurat">Muhurat Selection</option>
                  <option value="other">Other/General</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="message">Message / Specific Questions</label>
                <textarea id="message" placeholder="Describe your concerns or questions..."></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Submit Consultation Request
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-content">
          <div className="footer-section">
            <h3>Dia Astro</h3>
            <p>
              Your trusted partner in navigating life's journey through the wisdom of Vedic astrology. 
              Empowering you with clarity, guidance, and cosmic insights.
            </p>
          </div>
          <div className="footer-section">
            <h3>Quick Links</h3>
            <button className="footer-link" onClick={() => scrollToSection('services')}>Services</button>
            <button className="footer-link" onClick={() => scrollToSection('palm')}>Palm Reading</button>
            <button className="footer-link" onClick={() => scrollToSection('about')}>About Us</button>
            <button className="footer-link" onClick={() => scrollToSection('testimonials')}>Testimonials</button>
            <button className="footer-link" onClick={() => scrollToSection('faq')}>FAQ</button>
            <button className="footer-link" onClick={() => scrollToSection('contact')}>Contact</button>
          </div>
          <div className="footer-section">
            <h3>Services</h3>
            <span className="footer-text">Career Astrology</span>
            <span className="footer-text">Share Market Guidance</span>
            <span className="footer-text">Marriage Compatibility</span>
            <span className="footer-text">Birth Chart Analysis</span>
            <span className="footer-text">Karma Dosh Analysis</span>
          </div>
          <div className="footer-section">
            <h3>Contact Info</h3>
            <p>Phone: <a href="tel:+918625815099">+91 8625815099</a></p>
            <p>Email: <a href="mailto:ruchi.bhardwaj@diaastro.in">ruchi.bhardwaj@diaastro.in</a></p>
            <p>Domain: diaastro.in</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 Dia Astro. All rights reserved. | Designed with cosmic wisdom</p>
        </div>
      </footer>

      {/* WhatsApp Float Button */}
      <a 
        href="https://wa.me/918625815099?text=Hi, I would like to consult with Ruchi Bhardwaj" 
        className="whatsapp-float"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 32 32" width="36" height="36" fill="white">
          <path d="M16.002 0C7.164 0 0 7.164 0 16.002c0 2.83.748 5.49 2.052 7.786L.07 31.93l8.354-2.192A15.904 15.904 0 0 0 16.002 32c8.838 0 16.002-7.164 16.002-16.002S24.84 0 16.002 0zm0 29.336c-2.548 0-4.944-.72-6.976-1.968l-.5-.296-5.186 1.36 1.384-5.056-.324-.518a13.244 13.244 0 0 1-2.068-7.196c0-7.346 5.976-13.322 13.322-13.322s13.322 5.976 13.322 13.322-5.628 13.674-12.974 13.674zm7.308-9.978c-.4-.2-2.368-1.168-2.736-1.302-.368-.132-.636-.2-.904.2-.268.4-1.036 1.302-1.27 1.57-.234.266-.468.3-.868.1-.4-.2-1.69-.622-3.216-1.984-1.19-1.06-1.994-2.368-2.228-2.768-.234-.4-.026-.616.176-.816.18-.18.4-.468.6-.702.2-.234.268-.4.4-.668.132-.268.066-.502-.034-.702-.1-.2-.904-2.178-1.238-2.982-.326-.782-.656-.676-.904-.688-.234-.012-.502-.014-.77-.014s-.702.1-1.07.502c-.368.4-1.404 1.372-1.404 3.346s1.438 3.882 1.638 4.15c.2.268 2.83 4.32 6.856 6.056.958.414 1.706.66 2.29.846.962.306 1.836.262 2.528.16.77-.116 2.368-.968 2.702-1.904.334-.936.334-1.738.234-1.904-.1-.166-.368-.268-.768-.468z"/>
        </svg>
      </a>
    </div>
  );
}

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="faq-item">
      <div className="faq-question" onClick={() => setIsOpen(!isOpen)}>
        <span>{question}</span>
        <ChevronDown 
          size={24} 
          style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.3s ease'
          }} 
        />
      </div>
      {isOpen && <div className="faq-answer">{answer}</div>}
    </div>
  );
}
