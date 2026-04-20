export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            articles: {
                Row: {
                    id: string
                    title: string
                    slug: string
                    content: string
                    excerpt: string | null
                    image_url: string | null
                    published: boolean
                    author: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    slug: string
                    content: string
                    excerpt?: string | null
                    image_url?: string | null
                    published?: boolean
                    author?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    slug?: string
                    content?: string
                    excerpt?: string | null
                    image_url?: string | null
                    published?: boolean
                    author?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            profiles: {
                Row: {
                    id: string
                    role: 'admin' | 'student' | 'counselor'
                    full_name: string | null
                    subscription_tier: 'free' | 'premium' | 'plus'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    role?: 'admin' | 'student' | 'counselor'
                    full_name?: string | null
                    subscription_tier?: 'free' | 'premium' | 'plus'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    role?: 'admin' | 'student' | 'counselor'
                    full_name?: string | null
                    subscription_tier?: 'free' | 'premium' | 'plus'
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            colleges: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    location_city: string | null
                    location_state: string | null
                    type: string | null
                    rank: number | null
                    rating: number | null
                    fees: string | null
                    avg_package: string | null
                    exams: string | null
                    courses: string[] | null
                    image: string | null
                    is_published: boolean
                    visibility: 'public' | 'draft' | 'hidden'
                    review_count: number | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    slug: string
                    location_city?: string | null
                    location_state?: string | null
                    type?: string | null
                    rank?: number | null
                    rating?: number | null
                    fees?: string | null
                    avg_package?: string | null
                    exams?: string | null
                    courses?: string[] | null
                    image?: string | null
                    is_published?: boolean
                    visibility?: 'public' | 'draft' | 'hidden'
                    review_count?: number | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    slug?: string
                    location_city?: string | null
                    location_state?: string | null
                    type?: string | null
                    rank?: number | null
                    rating?: number | null
                    fees?: string | null
                    avg_package?: string | null
                    exams?: string | null
                    courses?: string[] | null
                    image?: string | null
                    is_published?: boolean
                    visibility?: 'public' | 'draft' | 'hidden'
                    review_count?: number | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            college_details: {
                Row: {
                    college_id: string
                    placement_stats: Json
                    detailed_fees: Json
                    hostel_info: string | null
                    admission_process: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    college_id: string
                    placement_stats?: Json
                    detailed_fees?: Json
                    hostel_info?: string | null
                    admission_process?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    college_id?: string
                    placement_stats?: Json
                    detailed_fees?: Json
                    hostel_info?: string | null
                    admission_process?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            college_qa: {
                Row: {
                    id: string
                    college_id: string | null
                    user_id: string | null
                    user_name: string | null
                    question: string
                    answer: string | null
                    answered_by: string | null
                    answered_at: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    college_id?: string | null
                    user_id?: string | null
                    user_name?: string | null
                    question: string
                    answer?: string | null
                    answered_by?: string | null
                    answered_at?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    college_id?: string | null
                    user_id?: string | null
                    user_name?: string | null
                    question?: string
                    answer?: string | null
                    answered_by?: string | null
                    answered_at?: string | null
                    created_at?: string
                }
                Relationships: []
            }
            cutoffs: {
                Row: {
                    id: string
                    college_id: string | null
                    year: number | null
                    category: string | null
                    score: number | null
                    rank: number | null
                    round: number | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    college_id?: string | null
                    year?: number | null
                    category?: string | null
                    score?: number | null
                    rank?: number | null
                    round?: number | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    college_id?: string | null
                    year?: number | null
                    category?: string | null
                    score?: number | null
                    rank?: number | null
                    round?: number | null
                    created_at?: string
                }
                Relationships: []
            }
            rankings: {
                Row: {
                    id: string
                    college_id: string | null
                    agency: string | null
                    year: number | null
                    rank: number | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    college_id?: string | null
                    agency?: string | null
                    year?: number | null
                    rank?: number | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    college_id?: string | null
                    agency?: string | null
                    year?: number | null
                    rank?: number | null
                    created_at?: string
                }
                Relationships: []
            }
            user_activity_logs: {
                Row: {
                    id: string
                    user_id: string | null
                    action: string | null
                    details: Json
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    action?: string | null
                    details?: Json
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    action?: string | null
                    details?: Json
                    created_at?: string
                }
                Relationships: []
            }
            counselling_requests: {
                Row: {
                    id: string
                    name: string
                    phone: string
                    email: string
                    neet_marks: number | null
                    city: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    phone: string
                    email: string
                    neet_marks?: number | null
                    city?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    phone?: string
                    email?: string
                    neet_marks?: number | null
                    city?: string | null
                    created_at?: string
                }
                Relationships: []
            }
            news_updates: {
                Row: {
                    id: string
                    title: string
                    content: string
                    image_url: string | null
                    tags: string[] | null
                    is_subscriber_only: boolean
                    published_at: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    content: string
                    image_url?: string | null
                    tags?: string[] | null
                    is_subscriber_only?: boolean
                    published_at?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    content?: string
                    image_url?: string | null
                    tags?: string[] | null
                    is_subscriber_only?: boolean
                    published_at?: string
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            admins: {
                Row: {
                    id: string
                    email: string
                    role: 'superadmin' | 'mini_admin'
                    permissions: Json
                    created_at: string
                }
                Insert: {
                    id: string
                    email: string
                    role?: 'superadmin' | 'mini_admin'
                    permissions?: Json
                    created_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    role?: 'superadmin' | 'mini_admin'
                    permissions?: Json
                    created_at?: string
                }
                Relationships: []
            }
            audit_logs: {
                Row: {
                    id: string
                    admin_id: string | null
                    action: string
                    entity_type: string | null
                    entity_id: string | null
                    details: Json
                    created_at: string
                }
                Insert: {
                    id?: string
                    admin_id?: string | null
                    action: string
                    entity_type?: string | null
                    entity_id?: string | null
                    details?: Json
                    created_at?: string
                }
                Update: {
                    id?: string
                    admin_id?: string | null
                    action?: string
                    entity_type?: string | null
                    entity_id?: string | null
                    details?: Json
                    created_at?: string
                }
                Relationships: []
            }
            career_applications: {
                Row: {
                    id: string
                    full_name: string | null
                    email: string | null
                    phone: string | null
                    role: string | null
                    position: string | null
                    resume_url: string | null
                    message: string | null
                    status: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    full_name?: string | null
                    email?: string | null
                    phone?: string | null
                    role?: string | null
                    position?: string | null
                    resume_url?: string | null
                    message?: string | null
                    status?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    full_name?: string | null
                    email?: string | null
                    phone?: string | null
                    role?: string | null
                    position?: string | null
                    resume_url?: string | null
                    message?: string | null
                    status?: string | null
                    created_at?: string
                }
                Relationships: []
            }
            college_courses: {
                Row: {
                    id: string
                    college_id: string | null
                    name: string
                    duration: string | null
                    degree_type: string | null
                    seats: number | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    college_id?: string | null
                    name: string
                    duration?: string | null
                    degree_type?: string | null
                    seats?: number | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    college_id?: string | null
                    name?: string
                    duration?: string | null
                    degree_type?: string | null
                    seats?: number | null
                    created_at?: string
                }
                Relationships: []
            }
            course_fees_breakdown: {
                Row: {
                    id: string
                    course_id: string | null
                    year: number | null
                    fee_type: string | null
                    amount: number | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    course_id?: string | null
                    year?: number | null
                    fee_type?: string | null
                    amount?: number | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    course_id?: string | null
                    year?: number | null
                    fee_type?: string | null
                    amount?: number | null
                    created_at?: string
                }
                Relationships: []
            }
            lead_scores: {
                Row: {
                    identifier: string
                    user_id: string | null
                    email: string | null
                    pricing_views: number
                    last_seen: string
                    created_at: string
                }
                Insert: {
                    identifier: string
                    user_id?: string | null
                    email?: string | null
                    pricing_views?: number
                    last_seen?: string
                    created_at?: string
                }
                Update: {
                    identifier?: string
                    user_id?: string | null
                    email?: string | null
                    pricing_views?: number
                    last_seen?: string
                    created_at?: string
                }
                Relationships: []
            }
            newsletter_subscriptions: {
                Row: {
                    id: string
                    email: string
                    name: string | null
                    phone: string | null
                    is_active: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    email: string
                    name?: string | null
                    phone?: string | null
                    is_active?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    name?: string | null
                    phone?: string | null
                    is_active?: boolean
                    created_at?: string
                }
                Relationships: []
            }
            reviews: {
                Row: {
                    id: string
                    college_id: string | null
                    user_id: string | null
                    user_name: string | null
                    rating: number | null
                    content: string | null
                    moderation_status: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    college_id?: string | null
                    user_id?: string | null
                    user_name?: string | null
                    rating?: number | null
                    content?: string | null
                    moderation_status?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    college_id?: string | null
                    user_id?: string | null
                    user_name?: string | null
                    rating?: number | null
                    content?: string | null
                    moderation_status?: string | null
                    created_at?: string
                }
                Relationships: []
            }
            saved_colleges: {
                Row: {
                    id: string
                    user_id: string | null
                    college_id: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    college_id?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    college_id?: string | null
                    created_at?: string
                }
                Relationships: []
            }
            user_profiles: {
                Row: {
                    id: string
                    user_id: string | null
                    full_name: string | null
                    email: string | null
                    phone: string | null
                    phone_number: string | null
                    neet_score: number | null
                    target_state: string | null
                    account_type: 'free' | 'premium' | 'pro'
                    is_banned: boolean
                    banned_at: string | null
                    last_sign_in_at: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    full_name?: string | null
                    email?: string | null
                    phone?: string | null
                    phone_number?: string | null
                    neet_score?: number | null
                    target_state?: string | null
                    account_type?: 'free' | 'premium' | 'pro'
                    is_banned?: boolean
                    banned_at?: string | null
                    last_sign_in_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    full_name?: string | null
                    email?: string | null
                    phone?: string | null
                    phone_number?: string | null
                    neet_score?: number | null
                    target_state?: string | null
                    account_type?: 'free' | 'premium' | 'pro'
                    is_banned?: boolean
                    banned_at?: string | null
                    last_sign_in_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            coupons: {
                Row: {
                    id: string
                    code: string
                    discount_percentage: number
                    razorpay_offer_id: string | null
                    is_active: boolean
                    max_uses: number | null
                    used_count: number
                    expires_at: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    code: string
                    discount_percentage: number
                    razorpay_offer_id?: string | null
                    is_active?: boolean
                    max_uses?: number | null
                    used_count?: number
                    expires_at?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    code?: string
                    discount_percentage?: number
                    razorpay_offer_id?: string | null
                    is_active?: boolean
                    max_uses?: number | null
                    used_count?: number
                    expires_at?: string | null
                    created_at?: string
                }
                Relationships: []
            }
        }
        Views: {
            view_public_colleges: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    location_city: string | null
                    location_state: string | null
                    type: 'government' | 'private' | 'deemed' | null
                    established_year: number | null
                    website_url: string | null
                    meta_data: Json
                }
                Relationships: []
            }
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
