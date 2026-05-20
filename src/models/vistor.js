import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema(
  {
    // Unique identifier for the visitor
    visitorId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    
    // IP address of the visitor
    ipAddress: {
      type: String,
      required: true,
    },
    
    // User agent information
    userAgent: {
      type: String,
    },
    
    // Browser information
    browser: {
      name: String,
      version: String,
    },
    
    // OS information
    os: {
      name: String,
      version: String,
    },
    
    // Device type (mobile, desktop, tablet)
    deviceType: {
      type: String,
      enum: ['mobile', 'desktop', 'tablet', 'unknown'],
      default: 'unknown',
    },
    
    // Current page/route
    currentPage: {
      type: String,
    },
    
    // Referrer page
    referrer: {
      type: String,
    },
    
    // Session ID
    sessionId: {
      type: String,
      index: true,
    },
    
    // Page views count
    pageViews: {
      type: Number,
      default: 1,
    },
    
    // Time spent on site (in seconds)
    timeSpentOnSite: {
      type: Number,
      default: 0,
    },
    
    // Last activity timestamp
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    
    // Country (if available)
    country: {
      type: String,
    },
    
    // City (if available)
    city: {
      type: String,
    },
    
    // Custom properties
    customData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    
    // Whether visitor is returning
    isReturning: {
      type: Boolean,
      default: false,
    },
    
    // Visitor source (direct, google, etc)
    source: {
      type: String,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Index for faster queries
visitorSchema.index({ createdAt: -1 });
visitorSchema.index({ sessionId: 1, lastActivity: -1 });

export const vistior = mongoose.models.Visitor || mongoose.model('Visitor', visitorSchema);