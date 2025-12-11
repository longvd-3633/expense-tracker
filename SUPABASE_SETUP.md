# Supabase Setup Guide

## 1. Cấu hình Email Templates

### Confirm Signup Email Template

Vào Supabase Dashboard → Authentication → Email Templates → **Confirm signup**

**Subject:**
```
Confirm Your Email
```

**Body (HTML):**
```html
<h2>Confirm Your Email</h2>
<p>Follow this link to confirm your email:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>
<p>Or copy and paste this URL into your browser:</p>
<p>{{ .ConfirmationURL }}</p>
```

**⚠️ QUAN TRỌNG:**
- **PHẢI dùng `{{ .ConfirmationURL }}`** - đây là URL có PKCE code được Supabase tạo tự động
- KHÔNG tự tạo URL với {{ .Token }} hoặc {{ .TokenHash }}
- Link sẽ tự động redirect về `/auth/callback` đã cấu hình

### Reset Password Email Template

Vào Supabase Dashboard → Authentication → Email Templates → Reset Password

**Subject:**
```
Reset Your Password
```

**Body (HTML):**
```html
<h2>Reset Password</h2>
<p>Follow this link to reset the password for your user:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>Or copy and paste this URL into your browser:</p>
<p>{{ .ConfirmationURL }}</p>
```

**⚠️ QUAN TRỌNG:**
- Cũng dùng `{{ .ConfirmationURL }}` cho reset password
- Supabase sẽ tự động thêm type=recovery

## 2. Cấu hình Site URL

Vào Supabase Dashboard → Settings → General → Site URL

**Development:**
```
http://localhost:3000
```

**Production:**
```
https://your-domain.com
```

## 3. Cấu hình Redirect URLs

Vào Supabase Dashboard → Authentication → URL Configuration → Redirect URLs

Thêm các URL sau:

**Development:**
```
http://localhost:3000/auth/callback
http://localhost:3000/reset-password
```

**Production:**
```
https://your-domain.com/auth/callback
https://your-domain.com/reset-password
```

## 4. Flow Reset Password

1. User vào `/forgot-password` và nhập email
2. Supabase gửi email với link: `http://localhost:3000/auth/callback?token_hash=xxx&type=recovery`
3. User click link → trang `/auth/callback`:
   - Supabase tự động đọc `token_hash` và tạo session
   - Page kiểm tra `type=recovery`
   - Redirect sang `/reset-password`
4. Trang `/reset-password`:
   - Kiểm tra session exists
   - Hiện form đổi mật khẩu
   - User nhập mật khẩu mới
   - Call `updatePassword()`
   - Success → redirect về `/login`

## 5. Kiểm tra cấu hình

### Check Email Template:
```sql
-- Run in Supabase SQL Editor
SELECT * FROM auth.config;
```

### Check Site URL trong .env:
```bash
cat .env | grep SUPABASE
```

### Test Reset Password Flow:
1. Vào http://localhost:3000/forgot-password
2. Nhập email đã đăng ký
3. Mở Browser Console (F12) → tab Console
4. Click link từ email
5. Xem console logs để debug:
   - "Callback URL: ..."
   - "Hash: ..."
   - "Session found: ..." hoặc "Access Token: ..."
   - "Recovery flow detected" (nếu type=recovery)

## 6. Troubleshooting

### Lỗi "Không tìm thấy token xác thực"
- Kiểm tra email template có dùng đúng `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery`
- Kiểm tra Site URL trong Supabase Settings
- Kiểm tra Redirect URLs có chứa `/auth/callback`

### User đã login khi vào home ("/") sau khi click link
- Điều này ĐÚNG! Supabase đã tạo session từ token_hash
- Vấn đề là link không redirect sang `/reset-password`
- Fix: Cập nhật email template theo hướng dẫn trên

### Session bị mất sau khi refresh
- Kiểm tra browser cookie settings
- Xóa cache và cookies
- Kiểm tra Supabase RLS policies
