// User types
export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUser extends User {
  token: string;
}

// Poll types
export interface PollOption {
  id: string;
  text: string;
  votes: number;
  pollId: string;
}

export interface Poll {
  id: string;
  title: string;
  description?: string;
  options: PollOption[];
  creatorId: string;
  creator: User;
  isActive: boolean;
  allowMultipleVotes: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  totalVotes: number;
}

export interface Vote {
  id: string;
  userId: string;
  pollId: string;
  optionId: string;
  createdAt: Date;
}

// Form types
export interface CreatePollData {
  title: string;
  description?: string;
  options: string[];
  allowMultipleVotes: boolean;
  expiresAt?: Date;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

// UI types
export interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<any>;
  disabled?: boolean;
}

export interface SidebarItem extends NavItem {
  items?: SidebarItem[];
}

// Filter and sort types
export interface PollFilters {
  search?: string;
  isActive?: boolean;
  creatorId?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'totalVotes' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// Error types
export interface FieldError {
  field: string;
  message: string;
}

export interface ValidationError {
  errors: FieldError[];
}
