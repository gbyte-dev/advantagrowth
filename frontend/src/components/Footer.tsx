import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Top Section */}
        <div className="footer-grid">
          {/* Company Info */}
          <div className="footer-col">
            <Link href="/" className="footer-logo">
              <i className="fas fa-chart-line"></i>
              <span>Advanta Growth</span>
            </Link>
            <p className="footer-description">
              Restaurant POS & Management System for modern food businesses.
            </p>
            <div className="footer-social">
              <a href="#" className="social-link" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="social-link" aria-label="LinkedIn">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/features">Features</Link></li>
              <li><Link href="/pricing">Pricing</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-col">
            <h4>Support</h4>
            <ul className="footer-links">
              <li><Link href="/contact">Contact Us</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4>Get in Touch</h4>
            <ul className="footer-contact">
              <li>
                <i className="fas fa-envelope"></i>
                <a href="mailto:support@advantagrowth.com">support@advantagrowth.com</a>
              </li>
              <li>
                <i className="fas fa-phone"></i>
                <a href="tel:+911234567890">+91 12345 67890</a>
              </li>
              <li>
                <i className="fas fa-map-marker-alt"></i>
                <span>Mumbai, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>&copy; {currentYear} Advanta Growth. All rights reserved.</p>
          <p>
            Made with <i className="fas fa-heart"></i> for restaurants
          </p>
        </div>
      </div>
    </footer>
  );
}