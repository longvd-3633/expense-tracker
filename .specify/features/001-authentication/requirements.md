# Feature 001: Authentication & Authorization

**Feature ID**: 001-authentication  
**User Story**: US0  
**Priority**: P0 (Required for all features)  
**Status**: Specification Complete  
**Owner**: Development Team

---

## Overview

Hệ thống xác thực và phân quyền người dùng sử dụng Supabase Auth, bao gồm đăng ký, đăng nhập, quản lý session, reset password, và bảo mật dữ liệu thông qua Row Level Security (RLS).

**User Story:**
> **As a** user  
> **I want to** đăng ký và đăng nhập vào ứng dụng  
> **So that** tôi có thể quản lý tài chính cá nhân và bảo mật dữ liệu của mình

---

## Functional Requirements

### FR-001: User Registration

#### FR-001.1: Email/Password Registration
- ✅ User có thể đăng ký tài khoản mới với email + password
- ✅ Email format validation: RFC 5322 compliant
- ✅ Email normalization: Convert to lowercase before storage
- ✅ Password requirements:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - Recommended: At least 1 special character
- ✅ Password strength indicator: Visual feedback (weak/medium/strong)

#### FR-001.2: Email Verification
- ✅ Email verification required (Supabase email confirmation)
- ✅ Verification link expires sau 24 giờ
- ✅ Resend verification email: Max 3 lần/giờ (rate limiting)
- ✅ Unverified accounts: Không thể login
- ✅ Auto-cleanup: Unverified accounts tự động xóa sau 7 ngày
- ✅ Verification success: Auto-login và redirect to dashboard

#### FR-001.3: Registration Error Handling
- ✅ Email already exists → "Email đã được sử dụng. Vui lòng đăng nhập hoặc sử dụng email khác."
- ✅ Invalid email format → "Email không hợp lệ. Vui lòng kiểm tra lại."
- ✅ Weak password → "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số."
- ✅ Network error → "Không thể kết nối. Vui lòng kiểm tra mạng và thử lại."
- ✅ Rate limit exceeded → "Quá nhiều yêu cầu. Vui lòng thử lại sau 1 giờ."

#### FR-001.4: Post-Registration Actions
- ✅ Auto-create default categories khi user đăng ký lần đầu (idempotent)
- ✅ Initialize user_settings với default values
- ✅ Send welcome email (optional P2)

---

### FR-002: User Login

#### FR-002.1: Email/Password Login
- ✅ User có thể đăng nhập với email + password
- ✅ Case-insensitive email matching
- ✅ Secure password comparison (bcrypt via Supabase)
- ✅ Remember me checkbox: Extend session to 30 days (default: 7 days)

#### FR-002.2: Login Error Handling
- ✅ Invalid credentials → "Email hoặc mật khẩu không đúng." (generic message để prevent email enumeration)
- ✅ Email not verified → "Vui lòng xác thực email. [Gửi lại email xác thực]"
- ✅ Account locked → "Tài khoản tạm khóa do đăng nhập sai quá nhiều. Thử lại sau 15 phút."
- ✅ Network error → "Không thể kết nối. Vui lòng thử lại."

#### FR-002.3: Brute Force Protection
- ✅ Max 5 failed attempts trong 15 phút → Lock account 15 phút
- ✅ Rate limiting: Max 10 login attempts/IP/phút
- ✅ CAPTCHA sau 3 failed attempts (optional P2)
- ✅ Account unlock: Automatic sau timeout HOẶC via password reset

#### FR-002.4: Session Management
- ✅ Session duration: 7 days (default) hoặc 30 days (Remember me)
- ✅ JWT token auto-refresh 5 phút trước khi expire
- ✅ Concurrent sessions: Allow multiple devices (max 5 active sessions)
- ✅ Session storage: HttpOnly cookies, Secure flag, SameSite=Lax
- ✅ Session revocation: Server-side on password change, manual logout

---

### FR-003: Token & Session Handling

#### FR-003.1: Token Expiration Handling
- ✅ Access token expire → Silent refresh với refresh token
- ✅ Refresh token expire → Force logout, redirect to login
- ✅ Preserve return URL: `/login?redirect=/transactions`
- ✅ Mid-operation expire:
  - Queue operation locally
  - Refresh token
  - Retry operation
  - Show: "Đang làm mới phiên. Vui lòng đợi..."

#### FR-003.2: Concurrent Session Management
- ✅ User đăng nhập 2 thiết bị → Allow both (max 5 devices)
- ✅ Session list: View active sessions (optional P2)
- ✅ Remote logout: Logout specific device (optional P2)
- ✅ Logout all: Revoke tất cả sessions except current

#### FR-003.3: Logout Handling
- ✅ User có thể đăng xuất
- ✅ Logout flow:
  - Clear local session (Supabase session, Pinia store, localStorage drafts)
  - Revoke refresh token server-side
  - Redirect to login page
- ✅ Pending API calls during logout:
  - Abort requests
  - Show toast: "Đã đăng xuất"
- ✅ Unsaved data warning:
  - Modal: "Bạn có thay đổi chưa lưu. Đăng xuất?"
  - Buttons: [Lưu & Đăng xuất] [Hủy]
- ✅ Logout race conditions:
  - Debounce logout button (prevent multiple clicks)
  - Single logout API call
- ✅ Logout during transaction creation:
  - Save to localStorage draft
  - Restore on next login với prompt

---

### FR-004: Password Reset

#### FR-004.1: Password Reset Request
- ✅ User có thể reset password qua email
- ✅ Enter email → Always show success message (prevent email enumeration)
- ✅ Reset link expires sau 1 giờ
- ✅ Reset link one-time use (invalid after successful reset)
- ✅ Rate limiting: Max 3 reset emails/email/giờ

#### FR-004.2: Password Reset Page
- ✅ New password validation: Same requirements as registration
- ✅ Confirm password field: Must match new password
- ✅ Password strength indicator
- ✅ Success → Auto-login với new password, redirect to dashboard
- ✅ Expired/invalid link → "Link đã hết hạn. [Gửi lại link reset]"

#### FR-004.3: Password Reset Security
- ✅ Reset token cryptographically secure (Supabase handles)
- ✅ Reset invalidates all existing sessions (force re-login on all devices)
- ✅ Email notification: "Mật khẩu đã được thay đổi. Nếu không phải bạn, [Liên hệ hỗ trợ]"
- ✅ Reset while logged in: Require current password confirmation (optional P2)

---

### FR-005: Protected Routes

#### FR-005.1: Route Protection
- ✅ Protected routes: Redirect to login nếu chưa authenticate
- ✅ Middleware check: `auth.user()` !== null
- ✅ Public routes: `/login`, `/register`, `/forgot-password`, `/reset-password`
- ✅ Protected routes: `/` (dashboard), `/transactions`, `/settings`, `/categories`

#### FR-005.2: Redirect Behavior
- ✅ Store intended destination: `/login?redirect=/transactions/123`
- ✅ After login → Redirect to intended page hoặc dashboard (default)
- ✅ Deep links preserved: Query params, hash fragments
- ✅ Already authenticated → Skip login page, direct to app
- ✅ Invalid redirect URL → Sanitize, default to dashboard (prevent open redirect)

---

### FR-006: Social Login (Optional P2)

#### FR-006.1: OAuth Providers
- ✅ Social login options: Google, GitHub
- ✅ OAuth flow: Supabase Auth handles
- ✅ Scopes: email, profile (minimal required)

#### FR-006.2: Account Linking
- ✅ Email conflict → Modal:
  - "Email đã tồn tại. [Đăng nhập bằng mật khẩu] [Liên kết tài khoản]"
- ✅ Link existing account: Require password confirmation
- ✅ Multiple providers: Allow link Google + GitHub to same account
- ✅ Unlink social provider: Require at least 1 login method (email/password OR social)

---

### FR-007: Data Isolation & RLS

#### FR-007.1: Row Level Security
- ✅ User chỉ thấy và quản lý được data của chính mình
- ✅ RLS enforcement: All queries filtered by `auth.uid()`
- ✅ Tables with RLS:
  - `transactions`: WHERE user_id = auth.uid()
  - `categories`: WHERE user_id = auth.uid() OR user_id IS NULL (default categories)
  - `user_settings`: WHERE user_id = auth.uid()

#### FR-007.2: Authorization Errors
- ✅ Bypass attempts logged và blocked
- ✅ 403 Forbidden → "Bạn không có quyền truy cập."
- ✅ Redirect to dashboard
- ✅ Security event logging (exclude sensitive data)

---

## Non-Functional Requirements

### NFR-001: Security

#### NFR-001.1: Password Security
- ✅ Password hashing: bcrypt via Supabase (automatic, work factor ≥ 10)
- ✅ Password storage: Never log hoặc expose passwords in any form
- ✅ Password transmission: HTTPS only (TLS 1.2+)
- ✅ Password in memory: Clear after use

#### NFR-001.2: Session Security
- ✅ HttpOnly cookies: Prevent JavaScript access
- ✅ Secure flag: HTTPS only
- ✅ SameSite=Lax: CSRF mitigation
- ✅ CSRF protection: Supabase handles via JWT

#### NFR-001.3: XSS Prevention
- ✅ Sanitize all user inputs (email, password hints)
- ✅ Content-Security-Policy headers
- ✅ No eval(), innerHTML với user data
- ✅ Vue auto-escaping (default)

#### NFR-001.4: SQL Injection Prevention
- ✅ Supabase parameterized queries (automatic)
- ✅ No raw SQL from user input
- ✅ ORM-level protections

#### NFR-001.5: Rate Limiting
- ✅ Login: 10 requests/minute/IP
- ✅ Registration: 3 requests/hour/IP
- ✅ Password reset: 3 requests/hour/email
- ✅ Email verification resend: 3 requests/hour/email
- ✅ 429 Too Many Requests → "Quá nhiều yêu cầu. Vui lòng thử lại sau."

---

### NFR-002: Performance

#### NFR-002.1: Response Times
- ✅ Login request: < 1s (p95)
- ✅ Registration request: < 2s (p95)
- ✅ Token refresh: < 500ms (p95)
- ✅ Session validation: < 100ms (server-side)

#### NFR-002.2: Availability
- ✅ Auth service uptime: 99.9% (Supabase SLA)
- ✅ Graceful degradation: Show cached user info if auth check fails temporarily

---

### NFR-003: Usability

#### NFR-003.1: Error Messages
- ✅ User-friendly: Vietnamese, không expose technical details
- ✅ Actionable: Provide clear next steps
- ✅ Consistent format: Toast/Modal/Inline based on severity

#### NFR-003.2: Loading States
- ✅ Login button: Disable + spinner during request
- ✅ Max wait time: 10s → Timeout error
- ✅ Progress indication for slow operations

---

## Testing Requirements

### Test-001: Security Testing

#### Test-001.1: RLS Bypass Attempts
- ✅ Manipulate `auth.uid()` in client → Should fail
- ✅ Direct API calls with fake JWT → Should fail
- ✅ SQL injection in email field → Should be sanitized
- ✅ XSS in email/password → Should be escaped

#### Test-001.2: Authentication Attacks
- ✅ Brute force login → Should lock account after 5 attempts
- ✅ JWT token manipulation → Should reject invalid tokens
- ✅ Session fixation → Should regenerate session ID
- ✅ CSRF attacks → Should fail (JWT protection)

---

### Test-002: Functional Testing

#### Test-002.1: Registration Flow
- ✅ Valid registration → Success
- ✅ Duplicate email → Error
- ✅ Weak password → Error
- ✅ Invalid email → Error
- ✅ Email verification → Success
- ✅ Expired verification link → Error
- ✅ Resend verification → Success

#### Test-002.2: Login Flow
- ✅ Valid credentials → Success
- ✅ Invalid credentials → Error
- ✅ Unverified email → Error
- ✅ Locked account → Error
- ✅ Remember me → 30-day session
- ✅ Token refresh → Auto-refresh before expiry

#### Test-002.3: Password Reset Flow
- ✅ Request reset → Email sent
- ✅ Valid reset link → Success
- ✅ Expired reset link → Error
- ✅ One-time use → Second use fails
- ✅ Rate limiting → Exceeds limit → Error

#### Test-002.4: Session Management
- ✅ Concurrent sessions → Allow up to 5
- ✅ Token expiration during operation → Auto-refresh + retry
- ✅ Logout with unsaved data → Warning modal
- ✅ Logout all devices → Revoke all sessions

---

### Test-003: Edge Cases

- ✅ Network failure during registration → Retry với same data → No duplicate accounts
- ✅ Email service down → Graceful error, allow retry
- ✅ Multiple tabs → Logout in Tab A → Tab B detects and redirects
- ✅ Browser back after logout → Redirect to login
- ✅ Deep link to protected route → Redirect to login → Return to deep link after login

---

## Technical Implementation

### Tech-001: Supabase Auth Configuration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/supabase'],
  supabase: {
    redirect: false, // Manual redirect handling
    redirectOptions: {
      login: '/login',
      callback: '/auth/callback',
      exclude: ['/register', '/forgot-password', '/reset-password']
    }
  }
})
```

### Tech-002: Middleware Implementation

```typescript
// app/middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const user = useSupabaseUser()
  
  // Public routes
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password']
  if (publicRoutes.includes(to.path)) {
    // Already logged in → redirect to app
    if (user.value) {
      return navigateTo('/')
    }
    return
  }
  
  // Protected routes
  if (!user.value) {
    // Preserve intended destination
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }
})
```

### Tech-003: Auth Composable

```typescript
// app/composables/useAuth.ts
export const useAuth = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  
  const login = async (email: string, password: string, rememberMe = false) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
      options: {
        // Remember me: 30 days, default: 7 days
        persistSession: rememberMe ? 2592000 : 604800
      }
    })
    
    if (error) {
      throw mapAuthError(error)
    }
    
    return data
  }
  
  const register = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    if (error) {
      throw mapAuthError(error)
    }
    
    return data
  }
  
  const logout = async () => {
    // Clear local state
    const transactionStore = useTransactionStore()
    const settingsStore = useSettingsStore()
    
    // Check for unsaved data
    if (transactionStore.hasUnsavedChanges) {
      const confirm = await showConfirmModal({
        title: 'Bạn có thay đổi chưa lưu',
        message: 'Đăng xuất sẽ mất các thay đổi chưa lưu.',
        confirmText: 'Lưu & Đăng xuất',
        cancelText: 'Hủy'
      })
      
      if (!confirm) return
      
      await transactionStore.saveDraft()
    }
    
    // Logout
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      throw mapAuthError(error)
    }
    
    // Clear stores
    transactionStore.$reset()
    settingsStore.$reset()
    
    // Redirect
    await navigateTo('/login')
  }
  
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.toLowerCase(),
      {
        redirectTo: `${window.location.origin}/reset-password`
      }
    )
    
    if (error) {
      throw mapAuthError(error)
    }
  }
  
  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })
    
    if (error) {
      throw mapAuthError(error)
    }
  }
  
  return {
    user,
    login,
    register,
    logout,
    resetPassword,
    updatePassword
  }
}

// Error mapping for user-friendly messages
function mapAuthError(error: any): Error {
  const messages: Record<string, string> = {
    'Invalid login credentials': 'Email hoặc mật khẩu không đúng.',
    'Email not confirmed': 'Vui lòng xác thực email.',
    'User already registered': 'Email đã được sử dụng.',
    'Invalid email': 'Email không hợp lệ.',
    'Password should be at least 8 characters': 'Mật khẩu phải có ít nhất 8 ký tự.'
  }
  
  return new Error(messages[error.message] || 'Đã có lỗi xảy ra. Vui lòng thử lại.')
}
```

### Tech-004: Validation Schema

```typescript
// app/utils/validation.ts
import { z } from 'zod'

export const emailSchema = z
  .string()
  .email('Email không hợp lệ')
  .transform(val => val.toLowerCase())

export const passwordSchema = z
  .string()
  .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
  .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
  .regex(/[a-z]/, 'Mật khẩu phải có ít nhất 1 chữ thường')
  .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 số')

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Mật khẩu không khớp',
  path: ['confirmPassword']
})

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
  rememberMe: z.boolean().optional()
})
```

---

## Dependencies

### External Dependencies
- ✅ **Supabase Auth**: Email/password provider enabled
- ✅ **Supabase SMTP**: Email verification and password reset
- ✅ **Browser**: Cookies enabled, localStorage available

### Internal Dependencies
- ✅ **Database**: `categories` table (for default categories seed)
- ✅ **Database**: `user_settings` table (for initialization)
- ✅ None (authentication is foundational)

---

## Success Criteria

- ✅ User có thể đăng ký tài khoản thành công trong < 2 phút
- ✅ User có thể đăng nhập thành công trong < 30 giây
- ✅ Email verification link works 100% of the time
- ✅ Password reset flow completes without errors
- ✅ RLS prevents access to other users' data (0 failures in security tests)
- ✅ Brute force attacks are blocked (account locks after 5 attempts)
- ✅ Session management works across multiple devices
- ✅ Token refresh happens transparently without user interruption

---

## Open Questions

1. **Social login priority**: Implement Google/GitHub OAuth in P0 or defer to P2?
   - **Decision needed**: Current spec marks as "optional P2"
   
2. **Session limit enforcement**: Hard limit 5 sessions or soft limit with warning?
   - **Recommendation**: Soft limit, auto-revoke oldest session if > 5

3. **Account deletion**: Self-service account deletion or require support contact?
   - **Decision needed**: Not in current spec

4. **Two-factor authentication (2FA)**: Future consideration?
   - **Decision needed**: Not in current spec

---

## Changes from Original Spec

**Additions (from Checklist Gaps):**
- ✅ Detailed password requirements (uppercase, lowercase, number)
- ✅ Email verification expiry and cleanup
- ✅ Brute force protection specifics (5 attempts, 15 min lock)
- ✅ Token expiration handling (auto-refresh, queue operations)
- ✅ Concurrent session management (max 5 devices)
- ✅ Logout race conditions handling
- ✅ Password reset security (one-time use, token expiry)
- ✅ Protected route redirect with return URL preservation
- ✅ Social login account linking flow
- ✅ RLS bypass attempt logging
- ✅ Comprehensive security testing requirements
- ✅ Rate limiting thresholds
- ✅ Performance SLAs

**No breaking changes to original US0 - only clarifications and additions.**
