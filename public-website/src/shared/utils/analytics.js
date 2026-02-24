// Analytics utility for tracking user interactions

class Analytics {
    constructor() {
        this.initialized = false;
        this.queue = [];
    }

    // Initialize analytics (placeholder for GA, Mixpanel, etc.)
    init(trackingId) {
        console.log('Analytics initialized with ID:', trackingId);
        this.initialized = true;
        this.trackingId = trackingId;

        // Process queued events
        this.queue.forEach((event) => this.track(event.name, event.properties));
        this.queue = [];
    }

    // Track page views
    trackPageView(pagePath, pageTitle) {
        const event = {
            event_type: 'page_view',
            page_path: pagePath,
            page_title: pageTitle,
            timestamp: new Date().toISOString(),
        };

        if (this.initialized) {
            console.log('📊 Page View:', event);
            // Add your analytics provider here
            // Example: gtag('event', 'page_view', event);
            // Example: mixpanel.track('Page View', event);
        } else {
            this.queue.push({ name: 'page_view', properties: event });
        }
    }

    // Track events
    track(eventName, properties = {}) {
        const event = {
            event_name: eventName,
            ...properties,
            timestamp: new Date().toISOString(),
        };

        if (this.initialized) {
            console.log('📊 Event:', eventName, event);
            // Add your analytics provider here
            // Example: gtag('event', eventName, event);
            // Example: mixpanel.track(eventName, event);
        } else {
            this.queue.push({ name: eventName, properties: event });
        }
    }

    // Track CTA clicks
    trackCTAClick(ctaName, ctaLocation, ctaType = 'button') {
        this.track('cta_click', {
            cta_name: ctaName,
            cta_location: ctaLocation,
            cta_type: ctaType,
        });
    }

    // Track form submissions
    trackFormSubmit(formName, formType = 'contact') {
        this.track('form_submit', {
            form_name: formName,
            form_type: formType,
        });
    }

    // Track navigation
    trackNavigation(linkName, destination) {
        this.track('navigation', {
            link_name: linkName,
            destination: destination,
        });
    }

    // Track user signup intent
    trackSignupIntent(source) {
        this.track('signup_intent', {
            source: source,
        });
    }

    // Track feature interaction
    trackFeatureInteraction(featureName, action) {
        this.track('feature_interaction', {
            feature_name: featureName,
            action: action,
        });
    }

    // Track pricing view
    trackPricingView(plan) {
        this.track('pricing_view', {
            plan: plan,
        });
    }

    // Track scroll depth
    trackScrollDepth(depth) {
        this.track('scroll_depth', {
            depth: depth, // e.g., 25, 50, 75, 100
        });
    }
}

// Export singleton instance
export const analytics = new Analytics();

// Hook for React components
export const useAnalytics = () => {
    return analytics;
};

export default analytics;
