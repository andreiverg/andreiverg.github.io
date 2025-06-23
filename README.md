# John Andrei Vergara - Portfolio Website

A modern, responsive portfolio website showcasing my work as a Computer Science and Statistics student at the University of Auckland. Built with vanilla HTML, CSS, and JavaScript, deployed on Cloudflare Pages.

## 🌟 About Me

I'm John Andrei Vergara, a Computer Science and Statistics student passionate about data analysis, algorithms, and problem-solving. I specialize in:

- **Data Analysis & Machine Learning**: Statistical modeling and data visualization using R and Python
- **Full-Stack Development**: Modern web technologies and software engineering
- **Algorithm Design**: Optimization and computational problem-solving

## 🚀 Features

### Home Page (`index.html`)
- **Hero Section**: Personal introduction with professional headshot
- **Skills Showcase**: Visual display of technical skills (HTML, CSS, Java, RStudio, Python)
- **About Me**: Detailed background and academic journey
- **Contact Form**: Integrated contact form using Formspree
- **Responsive Navigation**: Clean navigation with social media links

### Projects Page (`projects.html`)
- **Data Science Projects**: Machine learning and data analysis projects
- **Software Development**: Full-stack applications and mobile apps
- **Project Cards**: Detailed project descriptions with technology tags
- **Live Demo Links**: Direct links to project demonstrations

### Design Page (`design.html`)
- **Design Portfolio**: Showcase of design work and creative projects

## 🛠️ Technologies Used

### Frontend
- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with custom animations and responsive design
- **JavaScript**: Interactive functionality and dynamic content
- **Font Awesome**: Icon library for UI elements
- **Google Fonts**: Typography (Poppins, Space Mono)

### Deployment & Hosting
- **Cloudflare Pages**: Static site hosting
- **Cloudflare Workers**: Edge computing for enhanced performance
- **Formspree**: Contact form handling

### Development Tools
- **Wrangler**: Cloudflare Workers development tool
- **Git**: Version control

## 📁 Project Structure

```
andreiverg.github.io/
├── index.html              # Home page
├── projects.html           # Projects showcase
├── design.html             # Design portfolio
├── styles.css              # Main stylesheet
├── script.js               # JavaScript functionality
├── images/                 # Image assets
│   ├── favicon/           # Favicon files
│   ├── hero-headshot.webp # Profile photo
│   └── *.webp             # Skill logos and other images
├── videos/                 # Video content
├── workers-site/           # Cloudflare Workers
│   └── index.js           # Worker script
├── wrangler.toml          # Cloudflare configuration
├── _headers               # Custom headers
├── _redirects             # URL redirects
├── _routes.json           # Routing configuration
└── .nojekyll              # GitHub Pages configuration
```

## 🚀 Getting Started

### Prerequisites
- A modern web browser
- Git (for version control)
- Node.js (optional, for local development)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/andreiverg/andreiverg.github.io.git
   cd andreiverg.github.io
   ```

2. **Open in your browser**
   ```bash
   # Using Python (if installed)
   python -m http.server 8000
   
   # Using Node.js (if installed)
   npx serve .
   
   # Or simply open index.html in your browser
   ```

3. **View the site**
   Navigate to `http://localhost:8000` in your browser

### Deployment

This site is deployed on **Cloudflare Pages** with the following configuration:

- **Build Command**: None (static site)
- **Build Output Directory**: Root directory
- **Framework Preset**: None
- **Environment Variables**: Configured in Cloudflare dashboard

## 🔧 Configuration

### Contact Form
The contact form uses Formspree for email handling. To update the form endpoint:

1. Create a new form at [Formspree](https://formspree.io)
2. Update the form action in `index.html`:
   ```html
   <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
   ```

### Cloudflare Workers
The site uses Cloudflare Workers for enhanced performance. Configuration is in `wrangler.toml`.

### Custom Headers
Custom HTTP headers are configured in `_headers` for security and performance.

## 📱 Responsive Design

The website is fully responsive and optimized for:
- Desktop computers
- Tablets
- Mobile devices
- Various screen sizes and orientations

## 🎨 Design Features

- **Modern UI**: Clean, professional design with smooth animations
- **Dark/Light Theme**: Adaptive color scheme
- **Interactive Elements**: Hover effects and smooth transitions
- **Accessibility**: Semantic HTML and ARIA labels
- **Performance**: Optimized images and minimal dependencies

## 🔗 Links

- **Live Site**: [andreiverg.github.io](https://johnvergara.net/)
- **GitHub**: [@andreiverg](https://github.com/andreiverg)
- **LinkedIn**: [John Andrei Vergara](https://www.linkedin.com/in/john-andrei-vergara-3b9921285/)
- **Email**: andreivergara@outlook.co.nz

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

While this is a personal portfolio site, suggestions and feedback are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Contact

For questions, collaborations, or just to say hello:

- **Email**: andreivergara@outlook.co.nz
- **LinkedIn**: [John Andrei Vergara](https://www.linkedin.com/in/john-andrei-vergara-3b9921285/)
- **GitHub**: [@andreiverg](https://github.com/andreiverg)

---

*Built with ❤️ by John Andrei Vergara* 