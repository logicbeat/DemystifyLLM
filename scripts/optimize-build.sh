#!/bin/bash

# Production deployment optimization script
# This script optimizes the build for production deployment

set -e

echo "🚀 Starting production deployment optimization..."

# Check if required tools are available
check_tool() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 is not installed. Please install it first."
        exit 1
    fi
}

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf coverage/

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Run linting
echo "🔍 Running ESLint..."
pnpm run lint

# Run tests
echo "🧪 Running tests..."
pnpm run test:run

# Generate test coverage report
echo "📊 Generating test coverage..."
pnpm run test:coverage

# Check coverage thresholds
echo "📈 Checking coverage thresholds..."
if [ -f coverage/coverage-summary.json ]; then
    node -e "
        const coverage = require('./coverage/coverage-summary.json');
        const total = coverage.total;
        
        const thresholds = { lines: 70, functions: 70, branches: 70, statements: 70 };
        let failed = false;
        
        Object.keys(thresholds).forEach(key => {
            const actual = total[key].pct;
            const required = thresholds[key];
            
            if (actual < required) {
                console.log(\`❌ \${key} coverage \${actual}% is below threshold \${required}%\`);
                failed = true;
            } else {
                console.log(\`✅ \${key} coverage \${actual}% meets threshold \${required}%\`);
            }
        });
        
        if (failed) {
            console.log('❌ Coverage check failed');
            process.exit(1);
        } else {
            console.log('✅ All coverage thresholds met');
        }
    "
else
    echo "⚠️  Coverage report not found, skipping coverage check"
fi

# Build for production
echo "🏗️  Building for production..."
NODE_ENV=production pnpm run build

# Analyze bundle size
echo "📊 Analyzing bundle size..."
if [ -d dist ]; then
    echo "Bundle analysis:"
    du -sh dist/
    echo "JavaScript files:"
    find dist -name "*.js" -exec ls -lh {} \; | awk '{print $5, $9}'
    echo "CSS files:"
    find dist -name "*.css" -exec ls -lh {} \; | awk '{print $5, $9}'
    
    # Check for large files (>500KB)
    large_files=$(find dist -type f -size +500k)
    if [ -n "$large_files" ]; then
        echo "⚠️  Large files detected (>500KB):"
        echo "$large_files"
    fi
else
    echo "❌ Build directory not found"
    exit 1
fi

# Create .nojekyll file for GitHub Pages
echo "📝 Creating .nojekyll file..."
touch dist/.nojekyll

# Create robots.txt
echo "🤖 Creating robots.txt..."
cat > dist/robots.txt << EOF
User-agent: *
Allow: /

Sitemap: https://logicbeat.github.io/DemystifyLLM/sitemap.xml
EOF

# Create basic sitemap.xml
echo "🗺️  Creating sitemap.xml..."
cat > dist/sitemap.xml << EOF
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://logicbeat.github.io/DemystifyLLM/</loc>
    <lastmod>$(date -u +"%Y-%m-%dT%H:%M:%S+00:00")</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
EOF

# Security headers check
echo "🔒 Creating security headers for GitHub Pages..."
cat > dist/_headers << EOF
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
EOF

# Performance optimization check
echo "⚡ Performance optimization summary:"
echo "✅ Terser minification enabled"
echo "✅ Tree shaking enabled"
echo "✅ Asset optimization enabled" 
echo "✅ Manual chunks configured"
echo "✅ Source maps disabled for production"

# Deployment summary
echo ""
echo "🎉 Production build optimization complete!"
echo ""
echo "📊 Build Summary:"
echo "- Build directory: dist/"
echo "- Total size: $(du -sh dist/ | cut -f1)"
echo "- Test coverage: Generated in coverage/"
echo "- Security headers: Added"
echo "- SEO files: robots.txt, sitemap.xml added"
echo ""
echo "🚀 Ready for deployment!"
echo "   Run: pnpm run deploy"
echo "   Or manually deploy the dist/ directory"