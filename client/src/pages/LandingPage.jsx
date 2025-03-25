import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";

// Import all required images from the assets folder
import logo from "../assets/logo.png";
import navCta from "../assets/nav-without-hint.png";
import cta from "../assets/cta.png";
import statImage from "../assets/stat-image.png";
import statText1 from "../assets/stat-text-1.png";
import statText2 from "../assets/stat-text-2.png";
import statText3 from "../assets/stat-text-3.png";
import featuresBackground1 from "../assets/features-background-1.png";
import featuresBackground2 from "../assets/features-background-2.png";
import featuresBackground3 from "../assets/features-background-3.png";
import featuresBackground4 from "../assets/features-background-4.png";
import feature1Text from "../assets/feature1-text.png";
import feature1Image from "../assets/feature1-image.png";
import feature2Text from "../assets/feature2-text.png";
import feature2Image from "../assets/feature2-image.png";
import feature3Text from "../assets/feature3-text.png";
import feature3Image from "../assets/feature3-image.png";
import feature4Text from "../assets/feature4-text.png";
import feature4Image from "../assets/feature4-image.png";
import endCtaText from "../assets/end-cta-text.png";
import endCta from "../assets/end-cta.png";
import endMsg from "../assets/end-msg.png";
import glowDown from "../assets/glow-down.png";

const LandingPage = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [dotPos, setDotPos] = useState({ x: 0, y: 0 });
  const [ringPos, setRingPos] = useState({ x: 0, y: 0 });
  
  const cursorDotRef = useRef(null);
  const cursorRingRef = useRef(null);
  
  // Set up intersection observers for animations
  useEffect(() => {
    // Handle mouse movement for custom cursor
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    // Animation frame for smooth cursor movement
    let animationFrameId;
    
    const animateCursor = () => {
      // Smooth dot movement
      setDotPos(prev => ({
        x: prev.x + (mousePos.x - prev.x) * 0.2,
        y: prev.y + (mousePos.y - prev.y) * 0.2
      }));
      
      // Smooth ring movement
      setRingPos(prev => ({
        x: prev.x + (mousePos.x - prev.x) * 0.1,
        y: prev.y + (mousePos.y - prev.y) * 0.1
      }));
      
      animationFrameId = requestAnimationFrame(animateCursor);
    };
    
    animationFrameId = requestAnimationFrame(animateCursor);
    
    // Set up intersection observers for animations
    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          const delay = index * 200; // 200ms delay between each text
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);
        }
      });
    }, {
      threshold: 0.1
    });
    
    const featuresObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.1
    });
    
    const endObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.1
    });
    
    // Observe elements once they're in the DOM
    setTimeout(() => {
      document.querySelectorAll('.stat-text').forEach(text => {
        statObserver.observe(text);
      });
      
      document.querySelectorAll('.features-text').forEach(text => {
        featuresObserver.observe(text);
      });
      
      document.querySelectorAll('.feature-image-1, .feature-image-2, .feature-image-3, .feature-image-4').forEach(image => {
        featuresObserver.observe(image);
      });
      
      document.querySelectorAll('.end-text').forEach(text => {
        endObserver.observe(text);
      });
    }, 100);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      statObserver.disconnect();
      featuresObserver.disconnect();
      endObserver.disconnect();
    };
  }, [mousePos]);
  
  return (
    <div className="landing-page">
      <div className="cursor-dot" ref={cursorDotRef} style={{ transform: `translate(${dotPos.x}px, ${dotPos.y}px)` }}></div>
      <div className="cursor-ring" ref={cursorRingRef} style={{ transform: `translate(${ringPos.x - 20}px, ${ringPos.y - 20}px)` }}></div>
      
      <nav className="navbar">
        <div className="nav-left">
          <div className="nav-logo">
            <img src={logo} alt="Logo" />
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
        <div className="nav-right">
          <Link to="/auth">
            <img src={navCta} className="nav-cta-button" alt="Sign Up" />
          </Link>
        </div>
      </nav>
      
      <div className="hero-section">
        <div className="nebula-background">
          <div className="nebula-spot spot-1"></div>
          <div className="nebula-spot spot-2"></div>
          <div className="nebula-spot spot-3"></div>
          <div className="nebula-spot spot-4"></div>
        </div>
        <div className="hero-content">
          <h1 className="hero-title">Land your Dream Job, Smarter & Faster</h1>
          <p className="hero-subtext">AI Powered Job Application, Mock Interviews and Effortless Resume Creation</p>
          <Link to="/auth">
            <img src={cta} className="cta-button" alt="Get Started" />
          </Link>
        </div>
        <div className="scroll-indicator">
          <span className="scroll-text">Scroll Down</span>
          <div className="scroll-arrow"></div>
        </div>
      </div>
      
      <div className="stats">
        <div className="stats-background">
          <img src={statImage} alt="Statistics Background" />
        </div>
        <div className="stats-content">
          <img src={statText1} className="stat-text" alt="Stat 1" />
          <img src={statText2} className="stat-text" alt="Stat 2" />
          <img src={statText3} className="stat-text" alt="Stat 3" />
        </div>
        <img src={glowDown} className="glow-down" alt="Glow" />
      </div>
      
      <div className="features" id="features">
        <div className="feature-section">
          <img src={featuresBackground1} className="features-background" alt="Background" />
          <div className="features-content">
            <div className="features-text">
              <img src={feature1Text} alt="Features Text" className="feature-text-1" />
            </div>
            <div className="features-image">
              <img src={feature1Image} alt="Features Image" className="feature-image-1" />
            </div>
          </div>
        </div>
        
        <div className="feature-section">
          <img src={featuresBackground2} className="features-background" alt="Background" />
          <div className="features-content">
            <div className="features-text">
              <img src={feature2Text} alt="Features Text" className="feature-text-2" />
            </div>
            <div className="features-image">
              <img src={feature2Image} alt="Features Image" className="feature-image-2" />
            </div>
          </div>
        </div>
        
        <div className="feature-section">
          <img src={featuresBackground3} className="features-background" alt="Background" />
          <div className="features-content">
            <div className="features-text">
              <img src={feature3Text} alt="Features Text" className="feature-text-3" />
            </div>
            <div className="features-image">
              <img src={feature3Image} alt="Features Image" className="feature-image-1 feature-image-3" />
            </div>
          </div>
        </div>
        
        <div className="feature-section">
          <img src={featuresBackground1} className="features-background" alt="Background" />
          <div className="features-content">
            <div className="features-text">
              <img src={feature4Text} alt="Features Text" className="feature-text-2 feature-text-4" />
            </div>
            <div className="features-image">
              <img src={feature4Image} alt="Features Image" className="feature-image-2 feature-image-4" />
            </div>
          </div>
        </div>
        
        <div className="end-section" id="contact">
          <img src={featuresBackground4} className="features-background" alt="Background" />
          <div className="end-content">
            <img src={endCtaText} className="end-text end-text-1" alt="End CTA Text" />
            <Link to="/auth">
              <img src={endCta} className="end-text end-text-2" alt="End CTA" />
            </Link>
            <img src={endMsg} className="end-text end-text-3" alt="End Message" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;