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
                    created_at?: string
                    updated_at?: string
                }
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
            }
        }
    }
}
