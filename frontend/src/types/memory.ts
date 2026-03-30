export interface Memory {
  id: string
  content: string
  memory_type: 'fact' | 'episode' | 'skill'
  tags: string[]
  created_at: string
  updated_at: string
  access_count: number
  user_id?: string
  source?: string
  // fact-specific
  category?: string
  confidence?: number
  // episode-specific
  outcome?: string
  importance?: number
  project?: string
  // skill-specific
  domain?: string
  usage_count?: number
  // search result
  score?: number
}

export interface MemoryStats {
  total_memories: number
  collections: Record<string, {
    points_count: number
    indexed_vectors_count: number
    status: string
  }>
}

export interface TagInfo {
  name: string
  count: number
}

export interface HealthInfo {
  status: string
  qdrant: {
    host: string
    port: number
    collections: Record<string, any>
    total_vectors: number
  }
  embedding: {
    model: string
    dim: number
  }
  error?: string
}

export interface AppConfig {
  qdrant_host: string
  qdrant_port: number
  embedding_model: string
  embedding_dim: number
  dedup_exact: number
  dedup_merge: number
  dedup_related: number
  default_user_id: string
  default_top_k: number
}
