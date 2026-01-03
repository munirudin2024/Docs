#!/bin/bash

# ===============================================
# Firebase Setup Script for Cyber Enterprise
# ===============================================

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

clear
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     🔥 Firebase Setup - Cyber Enterprise      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Function to print section headers
print_header() {
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN} $1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# Function to print success message
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error message
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to print info message
print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if we're in the correct directory
cd /workspaces/Docs/node/cyber || {
    print_error "Directory /workspaces/Docs/node/cyber not found!"
    exit 1
}

print_header "Step 1: Check Firebase Project"

# Check if .env file exists
if [ -f ".env" ]; then
    print_info ".env file already exists"
    echo ""
    echo "Current Firebase configuration:"
    grep "VITE_FIREBASE" .env | sed 's/=.*$/=***hidden***/'
    echo ""
    read -p "Do you want to reconfigure Firebase? (y/N): " reconfigure
    
    if [[ ! $reconfigure =~ ^[Yy]$ ]]; then
        print_info "Using existing configuration"
        exit 0
    fi
fi

print_header "Step 2: Firebase Configuration"

echo "You need Firebase project credentials. Get them from:"
echo "https://console.firebase.google.com"
echo ""
echo "1. Go to Project Settings (⚙️ icon)"
echo "2. Scroll down to 'Your apps' section"
echo "3. Click on Web app (</> icon)"
echo "4. Copy the configuration values"
echo ""

read -p "Press Enter when you're ready to input credentials..."

# Input Firebase credentials
print_info "Enter your Firebase credentials:"
echo ""

read -p "API Key: " api_key
read -p "Auth Domain (e.g., yourproject.firebaseapp.com): " auth_domain
read -p "Project ID: " project_id
read -p "Storage Bucket (e.g., yourproject.appspot.com): " storage_bucket
read -p "Messaging Sender ID: " sender_id
read -p "App ID: " app_id
read -p "Measurement ID (optional, press Enter to skip): " measurement_id

print_header "Step 3: Creating .env file"

# Create .env file
cat > .env << EOF
# Firebase Configuration
# Generated on $(date)

VITE_FIREBASE_API_KEY=$api_key
VITE_FIREBASE_AUTH_DOMAIN=$auth_domain
VITE_FIREBASE_PROJECT_ID=$project_id
VITE_FIREBASE_STORAGE_BUCKET=$storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=$sender_id
VITE_FIREBASE_APP_ID=$app_id
VITE_FIREBASE_MEASUREMENT_ID=$measurement_id
EOF

print_success ".env file created successfully!"

print_header "Step 4: Firestore Collections Setup"

echo "The following Firestore collections are required:"
echo ""
echo "📦 eHRM Module:"
echo "   - employees"
echo "   - attendances"
echo "   - leave_requests"
echo "   - leave_balances"
echo ""
echo "📦 Supply Chain Module:"
echo "   - vendors"
echo "   - purchase_orders"
echo ""
echo "📦 Helpdesk Module:"
echo "   - tickets"
echo "   - ticket_comments"
echo "   - ticket_history"
echo "   - knowledge_base"
echo ""
echo "📦 Meeting Room Module:"
echo "   - meeting_rooms"
echo "   - room_bookings"
echo ""
echo "📦 Warehouse Module:"
echo "   - inventory_items"
echo "   - stock_movements"
echo ""

print_info "Would you like to create Firebase indexes and rules?"
read -p "Generate firebase.json and firestore.rules? (Y/n): " generate_config

if [[ ! $generate_config =~ ^[Nn]$ ]]; then
    print_header "Step 5: Creating Firebase Configuration Files"
    
    # Create firebase.json
    cat > firebase.json << 'EOF'
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
EOF
    
    # Create firestore.rules
    cat > firestore.rules << 'EOF'
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the document
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // eHRM Collections
    match /employees/{employeeId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated(); // Add role-based access in production
    }
    
    match /attendances/{attendanceId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated(); // Add ownership check in production
    }
    
    match /leave_requests/{requestId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated(); // Add role-based approval in production
    }
    
    match /leave_balances/{balanceId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated(); // Restrict to HR role in production
    }
    
    // Supply Chain Collections
    match /vendors/{vendorId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated(); // Add role-based access in production
    }
    
    match /purchase_orders/{poId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated(); // Add approval workflow in production
    }
    
    // Helpdesk Collections
    match /tickets/{ticketId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated();
    }
    
    match /ticket_comments/{commentId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
    }
    
    match /ticket_history/{historyId} {
      allow read: if isAuthenticated();
      allow write: if false; // Only system can write history
    }
    
    match /knowledge_base/{articleId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated(); // Add admin role check in production
    }
    
    // Meeting Room Collections
    match /meeting_rooms/{roomId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated(); // Add admin role in production
    }
    
    match /room_bookings/{bookingId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated(); // Add ownership check
    }
    
    // Warehouse Collections
    match /inventory_items/{itemId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated(); // Add warehouse role in production
    }
    
    match /stock_movements/{movementId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated(); // Add approval workflow
    }
  }
}
EOF
    
    # Create firestore.indexes.json
    cat > firestore.indexes.json << 'EOF'
{
  "indexes": [
    {
      "collectionGroup": "attendances",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "employeeId", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "leave_requests",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "employeeId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "leave_requests",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "purchase_orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "vendorId", "order": "ASCENDING" },
        { "fieldPath": "orderDate", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "tickets",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "tickets",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "requesterId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "tickets",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "assignedToId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "room_bookings",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "bookingDate", "order": "ASCENDING" },
        { "fieldPath": "startTime", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "room_bookings",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "roomId", "order": "ASCENDING" },
        { "fieldPath": "bookingDate", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "stock_movements",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "itemId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "stock_movements",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "createdAt", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
EOF
    
    print_success "firebase.json created"
    print_success "firestore.rules created"
    print_success "firestore.indexes.json created"
fi

print_header "Step 6: Authentication Setup"

echo "To enable Firebase Authentication:"
echo ""
echo "1. Go to Firebase Console → Authentication"
echo "2. Click 'Get Started'"
echo "3. Enable sign-in methods you want to use:"
echo "   • Email/Password (recommended)"
echo "   • Google"
echo "   • Other providers as needed"
echo ""

print_header "Step 7: Security Rules Deployment"

echo "To deploy Firestore rules and indexes:"
echo ""
echo -e "${YELLOW}  cd /workspaces/Docs/node/cyber${NC}"
echo -e "${YELLOW}  firebase login${NC}"
echo -e "${YELLOW}  firebase use --add  # Select your project${NC}"
echo -e "${YELLOW}  firebase deploy --only firestore${NC}"
echo ""

print_header "Setup Complete! 🎉"

echo ""
echo -e "${GREEN}✓ Firebase configuration is ready!${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Make sure all Firestore collections are created in Firebase Console"
echo "2. Enable Authentication methods"
echo "3. Deploy Firestore rules (see commands above)"
echo "4. Start your development server:"
echo -e "   ${YELLOW}npm run dev${NC}"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Quick start guide"
echo "   - ARCHITECTURE.md - Complete system guide"
echo "   - API-REFERENCE.md - All API methods"
echo ""

print_success "Happy coding! 🚀"
echo ""
