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
            engagement_campaigns: {
                Row: {
                    id: string
                    slug: string
                    name: string
                    objective: string
                    kpi_name: string
                    segment_rule: Json
                    is_active: boolean
                    schedule_version: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    slug: string
                    name: string
                    objective: string
                    kpi_name?: string
                    segment_rule?: Json
                    is_active?: boolean
                    schedule_version?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    slug?: string
                    name?: string
                    objective?: string
                    kpi_name?: string
                    segment_rule?: Json
                    is_active?: boolean
                    schedule_version?: number
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            engagement_steps: {
                Row: {
                    id: string
                    campaign_id: string
                    step_order: number
                    day_offset: number
                    channel: Database["public"]["Enums"]["engagement_channel"]
                    fallback_channel: Database["public"]["Enums"]["engagement_channel"] | null
                    template_key: string
                    delay_minutes: number
                    max_attempts: number
                    is_active: boolean
                    metadata: Json
                    created_at: string
                }
                Insert: {
                    id?: string
                    campaign_id: string
                    step_order: number
                    day_offset: number
                    channel: Database["public"]["Enums"]["engagement_channel"]
                    fallback_channel?: Database["public"]["Enums"]["engagement_channel"] | null
                    template_key: string
                    delay_minutes?: number
                    max_attempts?: number
                    is_active?: boolean
                    metadata?: Json
                    created_at?: string
                }
                Update: {
                    id?: string
                    campaign_id?: string
                    step_order?: number
                    day_offset?: number
                    channel?: Database["public"]["Enums"]["engagement_channel"]
                    fallback_channel?: Database["public"]["Enums"]["engagement_channel"] | null
                    template_key?: string
                    delay_minutes?: number
                    max_attempts?: number
                    is_active?: boolean
                    metadata?: Json
                    created_at?: string
                }
                Relationships: []
            }
            user_channel_preferences: {
                Row: {
                    user_id: string
                    email_opt_in: boolean
                    sms_opt_in: boolean
                    whatsapp_opt_in: boolean
                    timezone: string
                    locale: string
                    quiet_hours_start: number
                    quiet_hours_end: number
                    max_touches_per_day: number
                    unsubscribed_at: string | null
                    updated_at: string
                }
                Insert: {
                    user_id: string
                    email_opt_in?: boolean
                    sms_opt_in?: boolean
                    whatsapp_opt_in?: boolean
                    timezone?: string
                    locale?: string
                    quiet_hours_start?: number
                    quiet_hours_end?: number
                    max_touches_per_day?: number
                    unsubscribed_at?: string | null
                    updated_at?: string
                }
                Update: {
                    user_id?: string
                    email_opt_in?: boolean
                    sms_opt_in?: boolean
                    whatsapp_opt_in?: boolean
                    timezone?: string
                    locale?: string
                    quiet_hours_start?: number
                    quiet_hours_end?: number
                    max_touches_per_day?: number
                    unsubscribed_at?: string | null
                    updated_at?: string
                }
                Relationships: []
            }
            engagement_enrollments: {
                Row: {
                    id: string
                    user_id: string
                    campaign_id: string
                    status: Database["public"]["Enums"]["engagement_enrollment_status"]
                    current_step_order: number
                    enrolled_at: string
                    next_run_at: string
                    completed_at: string | null
                    exited_at: string | null
                    exit_reason: string | null
                    holdout_group: boolean
                    variant: string
                    metadata: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    campaign_id: string
                    status?: Database["public"]["Enums"]["engagement_enrollment_status"]
                    current_step_order?: number
                    enrolled_at?: string
                    next_run_at?: string
                    completed_at?: string | null
                    exited_at?: string | null
                    exit_reason?: string | null
                    holdout_group?: boolean
                    variant?: string
                    metadata?: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    campaign_id?: string
                    status?: Database["public"]["Enums"]["engagement_enrollment_status"]
                    current_step_order?: number
                    enrolled_at?: string
                    next_run_at?: string
                    completed_at?: string | null
                    exited_at?: string | null
                    exit_reason?: string | null
                    holdout_group?: boolean
                    variant?: string
                    metadata?: Json
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            engagement_messages: {
                Row: {
                    id: string
                    enrollment_id: string
                    step_id: string
                    user_id: string
                    channel: Database["public"]["Enums"]["engagement_channel"]
                    provider: string
                    status: Database["public"]["Enums"]["engagement_message_status"]
                    template_key: string
                    idempotency_key: string
                    provider_message_id: string | null
                    attempt_no: number
                    payload: Json
                    error_code: string | null
                    error_message: string | null
                    scheduled_at: string
                    sent_at: string | null
                    delivered_at: string | null
                    read_at: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    enrollment_id: string
                    step_id: string
                    user_id: string
                    channel: Database["public"]["Enums"]["engagement_channel"]
                    provider: string
                    status?: Database["public"]["Enums"]["engagement_message_status"]
                    template_key: string
                    idempotency_key: string
                    provider_message_id?: string | null
                    attempt_no?: number
                    payload?: Json
                    error_code?: string | null
                    error_message?: string | null
                    scheduled_at?: string
                    sent_at?: string | null
                    delivered_at?: string | null
                    read_at?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    enrollment_id?: string
                    step_id?: string
                    user_id?: string
                    channel?: Database["public"]["Enums"]["engagement_channel"]
                    provider?: string
                    status?: Database["public"]["Enums"]["engagement_message_status"]
                    template_key?: string
                    idempotency_key?: string
                    provider_message_id?: string | null
                    attempt_no?: number
                    payload?: Json
                    error_code?: string | null
                    error_message?: string | null
                    scheduled_at?: string
                    sent_at?: string | null
                    delivered_at?: string | null
                    read_at?: string | null
                    created_at?: string
                }
                Relationships: []
            }
            provider_delivery_events: {
                Row: {
                    id: string
                    message_id: string | null
                    provider: string
                    provider_message_id: string | null
                    event_type: string
                    event_time: string
                    raw_payload: Json
                    created_at: string
                }
                Insert: {
                    id?: string
                    message_id?: string | null
                    provider: string
                    provider_message_id?: string | null
                    event_type: string
                    event_time?: string
                    raw_payload?: Json
                    created_at?: string
                }
                Update: {
                    id?: string
                    message_id?: string | null
                    provider?: string
                    provider_message_id?: string | null
                    event_type?: string
                    event_time?: string
                    raw_payload?: Json
                    created_at?: string
                }
                Relationships: []
            }
            engagement_conversions: {
                Row: {
                    id: string
                    enrollment_id: string
                    user_id: string
                    conversion_event: string
                    revenue: number | null
                    converted_at: string
                    metadata: Json
                }
                Insert: {
                    id?: string
                    enrollment_id: string
                    user_id: string
                    conversion_event: string
                    revenue?: number | null
                    converted_at?: string
                    metadata?: Json
                }
                Update: {
                    id?: string
                    enrollment_id?: string
                    user_id?: string
                    conversion_event?: string
                    revenue?: number | null
                    converted_at?: string
                    metadata?: Json
                }
                Relationships: []
            }
            engagement_event_log: {
                Row: {
                    id: string
                    user_id: string | null
                    event_name: string
                    event_time: string
                    metadata: Json
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    event_name: string
                    event_time?: string
                    metadata?: Json
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    event_name?: string
                    event_time?: string
                    metadata?: Json
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
            resolve_user_channel: {
                Args: {
                    p_user_id: string
                    p_primary_channel: Database["public"]["Enums"]["engagement_channel"]
                    p_fallback_channel?: Database["public"]["Enums"]["engagement_channel"] | null
                }
                Returns: Database["public"]["Enums"]["engagement_channel"] | null
            }
        }
        Enums: {
            engagement_channel: "email" | "sms" | "rcs" | "whatsapp"
            engagement_enrollment_status: "active" | "paused" | "completed" | "exited"
            engagement_message_status: "pending" | "queued" | "sent" | "delivered" | "read" | "failed" | "cancelled"
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
