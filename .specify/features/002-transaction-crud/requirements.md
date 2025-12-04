# Feature 002: Transaction CRUD Operations

**Feature ID**: 002-transaction-crud  
**User Story**: US1  
**Priority**: P1 (Must Have - MVP)  
**Status**: Specification Complete  
**Owner**: Development Team  
**Dependencies**: 001-authentication (RLS, user context)

---

## Overview

Quản lý giao dịch thu/chi hoàn chỉnh với CRUD operations (Create, Read, Update, Delete), bao gồm validation, optimistic UI, conflict resolution, real-time sync và offline support.

**User Story:**
> **As a** user  
> **I want to** tạo, xem, sửa và xóa transactions  
> **So that** tôi có thể theo dõi thu chi hằng ngày

---

## Functional Requirements

### FR-010: Create Transaction

#### FR-010.1: Transaction Form
- ✅ Required fields: date, type (income/expense), amount, category
- ✅ Optional fields: description, tags
- ✅ Form layout:
  - Mobile: Single column, stacked fields
  - Desktop: 2 columns, grouped logically
- ✅ Field types:
  - Date: Native date picker (iOS/Android optimized)
  - Type: Toggle button (Income/Expense)
  - Amount: Numeric input, currency formatted
  - Category: Searchable dropdown với icon preview
  - Description: Text area, auto-expand
  - Tags: Multi-select chips input

#### FR-010.2: Field Validation

**Amount:**
- ✅ Required, must be > 0
- ✅ Maximum: 999,999,999,999.99
- ✅ Decimal places: Max 2 (rounded automatically)
- ✅ Min value: 0.01
- ✅ Format: Accept both "1000000" và "1.000.000"
- ✅ Error messages:
  - Empty → "Vui lòng nhập số tiền"
  - Zero/negative → "Số tiền phải lớn hơn 0"
  - Too large → "Số tiền quá lớn (tối đa 999 tỉ)"
  - Invalid format → "Số tiền không hợp lệ"

**Date:**
- ✅ Required
- ✅ Min date: 1900-01-01
- ✅ Max date: today + 1 year
- ✅ Default: today
- ✅ Error messages:
  - Empty → "Vui lòng chọn ngày"
  - Too old → "Ngày không hợp lệ (từ 1900 trở lại)"
  - Too far future → "Ngày không được quá 1 năm trong tương lai"

**Type:**
- ✅ Required
- ✅ Values: 'income' | 'expense'
- ✅ Default: 'expense' (common case)
- ✅ Toggle UI: Income (green) / Expense (red)

**Category:**
- ✅ Required
- ✅ Must exist và thuộc user (hoặc default category)
- ✅ Filter by type: Only show categories matching selected type
- ✅ Error messages:
  - Empty → "Vui lòng chọn danh mục"
  - Invalid → "Danh mục không tồn tại"
  - Type mismatch → Auto-filter, prevent selection

**Description:**
- ✅ Optional
- ✅ Max length: 500 characters
- ✅ Sanitize HTML: Strip all tags
- ✅ Character counter: Show "123/500"
- ✅ Error messages:
  - Too long → "Mô tả quá dài (tối đa 500 ký tự)"

**Tags:**
- ✅ Optional
- ✅ Max tags: 10
- ✅ Max tag length: 50 characters each
- ✅ Allowed characters: Letters, numbers, spaces, hyphens
- ✅ Auto-suggest: Show previously used tags
- ✅ Error messages:
  - Too many → "Tối đa 10 tags"
  - Tag too long → "Tag quá dài (tối đa 50 ký tự)"

#### FR-010.3: Validation Timing
- ✅ On blur: Validate field ngay khi user rời khỏi input
- ✅ On submit: Validate toàn bộ form
- ✅ Real-time: Amount formatting while typing
- ✅ Error display: Inline dưới field, red color, icon warning
- ✅ Clear errors: When user starts fixing the field

#### FR-010.4: Save Behavior

**Optimistic UI:**
- ✅ Hiển thị transaction ngay trong list (pending state)
- ✅ Show loading indicator on card
- ✅ Disable edit/delete buttons while pending

**Success Path:**
- ✅ API success → Toast "Đã thêm giao dịch" (3s, green, auto-dismiss)
- ✅ Close form modal/sheet
- ✅ Refresh list (transaction moves from pending to confirmed)
- ✅ Update dashboard summary
- ✅ Scroll to new transaction (smooth animation)

**Error Handling:**
- ✅ Network error:
  - Rollback UI (remove from list)
  - Modal: "Không thể lưu. Vui lòng kiểm tra kết nối."
  - Buttons: [Thử lại] [Lưu nháp] [Hủy]
- ✅ Validation error from server:
  - Rollback optimistic update
  - Show inline errors in form
  - Keep form open
- ✅ Database constraint error:
  - Map technical error to user-friendly message
  - E.g., "CHECK constraint" → "Số tiền phải lớn hơn 0"
  - E.g., "FOREIGN KEY" → "Danh mục không tồn tại"

#### FR-010.5: Duplicate Detection
- ✅ Check: Same date + amount + description + type within 5 minutes
- ✅ Warning modal:
  - "Giao dịch tương tự đã tồn tại:"
  - Show existing transaction details
  - "Tiếp tục tạo giao dịch mới?"
  - Buttons: [Có, tạo mới] [Không, hủy] [Sửa giao dịch cũ]
- ✅ User can still proceed (warning only, not blocking)

#### FR-010.6: Idempotency
- ✅ Generate client-side UUID before submit
- ✅ Include UUID in API request
- ✅ Server checks UUID, ignore duplicate requests
- ✅ User clicks Save nhiều lần → Only 1 transaction created
- ✅ Network retry with same UUID → Same transaction returned

---

### FR-011: View Transactions

#### FR-011.1: List Display
- ✅ Default sort: Date DESC (newest first)
- ✅ Group by: Date (optional, show date headers)
- ✅ Card layout:
  - Category icon + color
  - Amount (large, colored: green=income, red=expense)
  - Description (truncated if long)
  - Date (relative: "Hôm nay", "Hôm qua", "3 ngày trước")
  - Tags (chips, max 3 visible, "+2 more")

#### FR-011.2: Pagination / Virtual Scrolling
- ✅ Strategy: Virtual scrolling if > 1000 items
- ✅ Alternative: Pagination 50 items/page
- ✅ Infinite scroll: Load more on scroll to bottom
- ✅ Performance: Render only visible items
- ✅ Scroll restoration: Preserve position on navigation back

#### FR-011.3: Empty State
- ✅ No transactions at all:
  - Illustration: Empty wallet
  - Message: "Chưa có giao dịch nào. Bắt đầu theo dõi thu chi của bạn!"
  - CTA: [Thêm giao dịch đầu tiên]
- ✅ No results after filter:
  - Icon: Search with X
  - Message: "Không tìm thấy giao dịch nào"
  - CTA: [Xóa bộ lọc]

#### FR-011.4: Loading State
- ✅ Initial load: Skeleton screens (5 cards with shimmer animation)
- ✅ Refresh: Pull-to-refresh (mobile), refresh button (desktop)
- ✅ Load more: Spinner at bottom during pagination
- ✅ Max wait: 10s → Timeout error

#### FR-011.5: Error State
- ✅ Network error:
  - Icon: Disconnected wifi
  - Message: "Không thể tải dữ liệu. Vui lòng kiểm tra kết nối."
  - CTA: [Thử lại]
- ✅ Server error:
  - Icon: Warning triangle
  - Message: "Đã có lỗi xảy ra. Vui lòng thử lại sau."
  - CTA: [Thử lại] [Liên hệ hỗ trợ]

#### FR-011.6: Real-time Updates
- ✅ Supabase subscription: Listen to transactions table
- ✅ Filter: WHERE user_id = auth.uid()
- ✅ Events: INSERT, UPDATE, DELETE
- ✅ Insert: Add to list với animation (slide in from top)
- ✅ Update: Update in-place với highlight flash
- ✅ Delete: Remove với fade-out animation
- ✅ Latency: < 1s from server event to UI update
- ✅ Subscription disconnect:
  - Show warning banner: "Mất kết nối. Đang tải lại..."
  - Fallback to manual refresh
  - Retry connection every 5s (max 3 attempts)

---

### FR-012: Update Transaction

#### FR-012.1: Edit Flow
- ✅ Click transaction card → Open edit form modal/sheet
- ✅ Pre-fill form với current data
- ✅ Same validation as Create
- ✅ Highlight changed fields (optional visual feedback)

#### FR-012.2: Optimistic Update
- ✅ Update UI immediately when user saves
- ✅ Show loading state on card
- ✅ Success → Toast "Đã cập nhật" (2s, green)
- ✅ Error → Rollback to old values, show error

#### FR-012.3: Conflict Detection

**Transaction Deleted:**
- ✅ Edit form open, transaction deleted by another device
- ✅ On save attempt:
  - Error: "Giao dịch đã bị xóa. Vui lòng tải lại."
  - Buttons: [Đóng] [Tải lại danh sách]

**Transaction Updated Concurrently:**
- ✅ User A edits on mobile, User B edits same transaction on desktop
- ✅ First save wins (simple last-write-wins)
- ✅ Second save detects conflict:
  - Modal: "Giao dịch đã được cập nhật bởi thiết bị khác."
  - Show diff:
    - "Giá trị cũ: [old_value]"
    - "Giá trị mới từ server: [server_value]"
    - "Giá trị của bạn: [your_value]"
  - Buttons: [Đè lên thay đổi của tôi] [Giữ thay đổi mới nhất] [Xem chi tiết]
- ✅ Advanced (Optional P2): Optimistic locking với version field

#### FR-012.4: Validation Error on Update
- ✅ Server rejects update (e.g., category deleted)
- ✅ Revert optimistic update
- ✅ Show inline errors in form
- ✅ Keep form open for user to fix

---

### FR-013: Delete Transaction

#### FR-013.1: Delete Confirmation
- ✅ Click delete button → Confirmation modal
- ✅ Modal content:
  - Title: "Xóa giao dịch này?"
  - Details: "[Amount] ₫ - [Category] - [Date]"
  - Warning: "Hành động này không thể hoàn tác."
  - Buttons: [Xóa] (red, destructive) [Hủy] (default focus)

#### FR-013.2: Optimistic Delete
- ✅ Confirm → Fade out card immediately
- ✅ Remove from list với animation
- ✅ Success → Toast "Đã xóa" với [Hoàn tác] button (5s timeout, yellow)

#### FR-013.3: Undo Delete
- ✅ Click [Hoàn tác] trong 5 giây
- ✅ Restore transaction to list (slide in animation)
- ✅ Toast "Đã khôi phục" (2s, green)
- ✅ Cancel permanent delete API call

#### FR-013.4: Permanent Delete
- ✅ Undo timeout (5s) → Call delete API
- ✅ Success → Transaction permanently deleted
- ✅ Error:
  - Restore transaction to list
  - Toast "Không thể xóa. [Thử lại]" (5s, red)

#### FR-013.5: Concurrent Delete
- ✅ Transaction already deleted by another device
- ✅ Delete attempt → Silent success (idempotent)
- ✅ Message: "Giao dịch đã bị xóa" (toast, 2s, neutral)

---

### FR-014: Multi-device Sync & Offline

#### FR-014.1: Multi-device Sync
- ✅ User A tạo transaction trên mobile → User B thấy ngay trên desktop
- ✅ Sync latency: < 1s (target), < 3s (acceptable)
- ✅ Conflict resolution: Last-write-wins với server timestamp
- ✅ Visual indicator: "Đang đồng bộ..." badge on pending items

#### FR-014.2: Offline Mode
- ✅ Detect offline: Navigator.onLine API + failed request detection
- ✅ Show banner: "Không có kết nối. Thay đổi sẽ được lưu khi online."
- ✅ Queue operations:
  - Store in localStorage: `offline_queue`
  - Include: operation type (create/update/delete), data, timestamp, UUID
- ✅ UI behavior:
  - Allow CRUD operations (optimistic UI)
  - Show "Pending sync" badge on cards
  - Disable features requiring server (e.g., filters by server-side data)

#### FR-014.3: Online Resume
- ✅ Detect online: Online event + periodic ping
- ✅ Process queue:
  - Sort by timestamp (maintain order)
  - Execute operations sequentially
  - Handle errors (skip failed, continue with rest)
- ✅ Sync completion:
  - Toast "Đã đồng bộ [N] giao dịch" (3s, green)
  - Clear queue
  - Refresh list from server (reconcile)

#### FR-014.4: Conflict During Sync
- ✅ Offline create → Online, item already exists (duplicate UUID)
  - Use existing item, discard queue entry
- ✅ Offline update → Online, item deleted
  - Prompt: "Giao dịch đã bị xóa. Tạo mới?" [Có] [Không]
- ✅ Offline delete → Online, item already deleted
  - Silent success (idempotent)

---

## Non-Functional Requirements

### NFR-010: Performance

#### NFR-010.1: Response Times
- ✅ Create transaction: < 1s (p95)
- ✅ Update transaction: < 800ms (p95)
- ✅ Delete transaction: < 500ms (p95)
- ✅ Load list (50 items): < 500ms (p95)
- ✅ Load list (1000 items): < 2s (p95, với virtual scrolling)

#### NFR-010.2: Rendering Performance
- ✅ List rendering: < 100ms for 1000 items (virtual scrolling)
- ✅ Scroll performance: 60 FPS (no jank)
- ✅ Animation frame rate: 60 FPS (transitions, loading)
- ✅ Form input latency: < 100ms (keystroke to screen update)

---

### NFR-011: Data Integrity

#### NFR-011.1: Database Constraints
- ✅ Foreign key: category_id REFERENCES categories(id) ON DELETE RESTRICT
- ✅ Check constraint: amount > 0 (enforced at DB level)
- ✅ RLS: user_id = auth.uid() (all operations)
- ✅ NOT NULL: date, type, amount, category_id, user_id

#### NFR-011.2: Data Validation
- ✅ Client-side: Immediate feedback, prevent bad requests
- ✅ Server-side: Final enforcement (never trust client)
- ✅ Schema validation: Zod schema on both client + server

---

### NFR-012: Usability

#### NFR-012.1: Responsive Design
- ✅ Mobile (< 640px):
  - Single column layout
  - Full-width forms
  - Bottom sheet modals
  - Touch targets ≥ 44x44px
  - Swipe gestures: Swipe left to delete (optional)
- ✅ Tablet (640-1024px):
  - 2 column list
  - Side panel for forms
  - Modal dialogs
- ✅ Desktop (> 1024px):
  - 3 column list (or 2 columns + sidebar)
  - Modal dialogs
  - Keyboard shortcuts

#### NFR-012.2: Keyboard Navigation
- ✅ Tab order: Logical, follows visual flow
- ✅ Enter: Submit form, select dropdown item
- ✅ Escape: Close modal, cancel operation
- ✅ Arrow keys: Navigate dropdown, date picker
- ✅ Shortcuts (optional P2):
  - Ctrl/Cmd + N: New transaction
  - Ctrl/Cmd + S: Save form
  - Delete: Delete selected transaction

#### NFR-012.3: Accessibility
- ✅ ARIA labels: All interactive elements
- ✅ Screen reader support: Announce state changes
- ✅ Keyboard only navigation: Fully functional
- ✅ Focus indicators: Visible outline on focused elements
- ✅ Color contrast: ≥ 4.5:1 for text

---

## Testing Requirements

### Test-010: CRUD Operations

#### Test-010.1: Create Transaction
- ✅ Valid data → Success
- ✅ Invalid amount (0, negative, too large) → Error
- ✅ Invalid date (empty, too old, too far future) → Error
- ✅ Invalid category (deleted, wrong type) → Error
- ✅ Description > 500 chars → Error
- ✅ Network error during save → Rollback, allow retry
- ✅ Duplicate detection → Warning, allow proceed
- ✅ Idempotency → Multiple saves create only 1

#### Test-010.2: Read Transactions
- ✅ Empty list → Empty state
- ✅ 1 transaction → Display correctly
- ✅ 100 transactions → Render within performance budget
- ✅ 1000 transactions → Virtual scrolling, smooth
- ✅ Network error → Error state với retry
- ✅ Real-time insert → Add to list with animation

#### Test-010.3: Update Transaction
- ✅ Valid changes → Success
- ✅ No changes → No API call, close form
- ✅ Invalid changes → Validation errors
- ✅ Concurrent update conflict → Show diff, allow resolution
- ✅ Transaction deleted → Error, reload list

#### Test-010.4: Delete Transaction
- ✅ Confirm delete → Success
- ✅ Undo within 5s → Restore
- ✅ Undo timeout → Permanent delete
- ✅ Network error → Rollback, show error
- ✅ Already deleted → Silent success

---

### Test-011: Edge Cases

- ✅ Offline create → Online → Sync success
- ✅ Offline update → Online, item deleted → Prompt user
- ✅ Multiple tabs → Create in Tab A → Tab B updates immediately
- ✅ Multiple tabs → Delete in Tab A → Tab B removes item
- ✅ Extremely long description (XSS attempt) → Sanitized
- ✅ SQL injection in description → Parameterized query prevents
- ✅ Amount with many decimals (1.123456789) → Rounded to 2 places
- ✅ Date in year 3000 → Validation error
- ✅ Negative amount via API manipulation → DB constraint rejects

---

### Test-012: Security

- ✅ Create transaction for other user → RLS blocks
- ✅ Update transaction of other user → RLS blocks
- ✅ Delete transaction of other user → RLS blocks
- ✅ Access transaction via direct URL → RLS blocks if not owner
- ✅ SQL injection in all fields → Sanitized/parameterized

---

## Technical Implementation

### Tech-010: Data Model

```typescript
// types/transaction.ts
export interface Transaction {
  id: string                     // UUID
  userId: string                 // User ID (from Supabase Auth)
  date: Date                     // Transaction date
  type: 'income' | 'expense'     // Transaction type
  amount: number                 // Amount in VND (max 2 decimals)
  categoryId: string             // Category UUID
  description?: string           // Optional, max 500 chars
  tags?: string[]                // Optional, max 10 tags
  createdAt: Date                // Server timestamp
  updatedAt: Date                // Server timestamp
}

export interface TransactionFormData {
  date: string                   // ISO date string
  type: 'income' | 'expense'
  amount: string                 // String for input, convert to number
  categoryId: string
  description?: string
  tags?: string[]
}
```

### Tech-011: Validation Schema

```typescript
// utils/validation.ts
import { z } from 'zod'
import { addYears } from 'date-fns'

export const transactionSchema = z.object({
  date: z.date()
    .min(new Date('1900-01-01'), 'Ngày không hợp lệ (từ 1900 trở lại)')
    .max(addYears(new Date(), 1), 'Ngày không được quá 1 năm trong tương lai'),
  type: z.enum(['income', 'expense']),
  amount: z.number()
    .positive('Số tiền phải lớn hơn 0')
    .max(999999999999.99, 'Số tiền quá lớn (tối đa 999 tỉ)')
    .multipleOf(0.01, 'Số tiền chỉ được 2 chữ số thập phân'),
  categoryId: z.string().uuid('Danh mục không hợp lệ'),
  description: z.string()
    .max(500, 'Mô tả quá dài (tối đa 500 ký tự)')
    .transform(val => sanitizeHtml(val)) // Strip HTML tags
    .optional(),
  tags: z.array(
    z.string().max(50, 'Tag quá dài (tối đa 50 ký tự)')
  ).max(10, 'Tối đa 10 tags').optional()
})

export const transactionFormSchema = transactionSchema.extend({
  date: z.string().transform(val => new Date(val)),
  amount: z.string()
    .transform(val => parseFloat(val.replace(/\./g, '').replace(',', '.')))
    .pipe(z.number().positive().max(999999999999.99).multipleOf(0.01))
})
```

### Tech-012: Pinia Store

```typescript
// stores/transactions.ts
import { defineStore } from 'pinia'
import type { Transaction } from '~/types/transaction'

export const useTransactionStore = defineStore('transactions', () => {
  const supabase = useSupabaseClient()
  
  // State
  const transactions = ref<Transaction[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const subscription = ref<any>(null)
  
  // Getters
  const sortedTransactions = computed(() => {
    return [...transactions.value].sort((a, b) => 
      b.date.getTime() - a.date.getTime()
    )
  })
  
  const transactionsByDateRange = computed(() => {
    return (startDate: Date, endDate: Date) => {
      return transactions.value.filter(t => 
        t.date >= startDate && t.date <= endDate
      )
    }
  })
  
  const totalIncome = computed(() => {
    return (startDate: Date, endDate: Date) => {
      return transactions.value
        .filter(t => 
          t.type === 'income' && 
          t.date >= startDate && 
          t.date <= endDate
        )
        .reduce((sum, t) => sum + t.amount, 0)
    }
  })
  
  const totalExpense = computed(() => {
    return (startDate: Date, endDate: Date) => {
      return transactions.value
        .filter(t => 
          t.type === 'expense' && 
          t.date >= startDate && 
          t.date <= endDate
        )
        .reduce((sum, t) => sum + t.amount, 0)
    }
  })
  
  const balance = computed(() => {
    return (startDate: Date, endDate: Date) => {
      return totalIncome.value(startDate, endDate) - 
             totalExpense.value(startDate, endDate)
    }
  })
  
  // Actions
  async function fetchTransactions() {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false })
      
      if (fetchError) throw fetchError
      
      transactions.value = data.map(t => ({
        ...t,
        date: new Date(t.date),
        createdAt: new Date(t.created_at),
        updatedAt: new Date(t.updated_at)
      }))
      
      // Setup real-time subscription
      setupSubscription()
    } catch (err) {
      error.value = 'Không thể tải dữ liệu. Vui lòng thử lại.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }
  
  async function createTransaction(data: TransactionFormData) {
    const id = crypto.randomUUID()
    
    // Optimistic update
    const tempTransaction: Transaction = {
      id,
      userId: '', // Will be set by RLS
      date: new Date(data.date),
      type: data.type,
      amount: parseFloat(data.amount),
      categoryId: data.categoryId,
      description: data.description,
      tags: data.tags,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    transactions.value.unshift(tempTransaction)
    
    try {
      const { data: created, error: createError } = await supabase
        .from('transactions')
        .insert({
          id,
          date: data.date,
          type: data.type,
          amount: data.amount,
          category_id: data.categoryId,
          description: data.description,
          tags: data.tags
        })
        .select()
        .single()
      
      if (createError) throw createError
      
      // Update with server data
      const index = transactions.value.findIndex(t => t.id === id)
      if (index !== -1) {
        transactions.value[index] = {
          ...created,
          date: new Date(created.date),
          createdAt: new Date(created.created_at),
          updatedAt: new Date(created.updated_at)
        }
      }
      
      return created
    } catch (err) {
      // Rollback optimistic update
      transactions.value = transactions.value.filter(t => t.id !== id)
      throw err
    }
  }
  
  async function updateTransaction(id: string, data: Partial<TransactionFormData>) {
    const index = transactions.value.findIndex(t => t.id === id)
    if (index === -1) throw new Error('Transaction not found')
    
    const oldTransaction = { ...transactions.value[index] }
    
    // Optimistic update
    transactions.value[index] = {
      ...oldTransaction,
      ...data,
      date: data.date ? new Date(data.date) : oldTransaction.date,
      amount: data.amount ? parseFloat(data.amount) : oldTransaction.amount,
      updatedAt: new Date()
    }
    
    try {
      const { data: updated, error: updateError } = await supabase
        .from('transactions')
        .update({
          date: data.date,
          type: data.type,
          amount: data.amount,
          category_id: data.categoryId,
          description: data.description,
          tags: data.tags
        })
        .eq('id', id)
        .select()
        .single()
      
      if (updateError) throw updateError
      
      // Update with server data
      transactions.value[index] = {
        ...updated,
        date: new Date(updated.date),
        createdAt: new Date(updated.created_at),
        updatedAt: new Date(updated.updated_at)
      }
      
      return updated
    } catch (err) {
      // Rollback optimistic update
      transactions.value[index] = oldTransaction
      throw err
    }
  }
  
  async function deleteTransaction(id: string) {
    const index = transactions.value.findIndex(t => t.id === id)
    if (index === -1) return // Already deleted
    
    const deleted = transactions.value[index]
    
    // Optimistic delete
    transactions.value.splice(index, 1)
    
    // Setup undo timeout
    const undoTimeout = setTimeout(async () => {
      try {
        const { error: deleteError } = await supabase
          .from('transactions')
          .delete()
          .eq('id', id)
        
        if (deleteError) throw deleteError
      } catch (err) {
        // Rollback on error
        transactions.value.splice(index, 0, deleted)
        throw err
      }
    }, 5000)
    
    // Return undo function
    return () => {
      clearTimeout(undoTimeout)
      transactions.value.splice(index, 0, deleted)
    }
  }
  
  function setupSubscription() {
    if (subscription.value) return
    
    subscription.value = supabase
      .channel('transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${useSupabaseUser().value?.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newTransaction = {
              ...payload.new,
              date: new Date(payload.new.date),
              createdAt: new Date(payload.new.created_at),
              updatedAt: new Date(payload.new.updated_at)
            }
            
            // Avoid duplicates (optimistic update already added)
            if (!transactions.value.find(t => t.id === newTransaction.id)) {
              transactions.value.unshift(newTransaction)
            }
          } else if (payload.eventType === 'UPDATE') {
            const index = transactions.value.findIndex(t => t.id === payload.new.id)
            if (index !== -1) {
              transactions.value[index] = {
                ...payload.new,
                date: new Date(payload.new.date),
                createdAt: new Date(payload.new.created_at),
                updatedAt: new Date(payload.new.updated_at)
              }
            }
          } else if (payload.eventType === 'DELETE') {
            transactions.value = transactions.value.filter(t => t.id !== payload.old.id)
          }
        }
      )
      .subscribe()
  }
  
  function cleanupSubscription() {
    if (subscription.value) {
      subscription.value.unsubscribe()
      subscription.value = null
    }
  }
  
  return {
    transactions,
    loading,
    error,
    sortedTransactions,
    transactionsByDateRange,
    totalIncome,
    totalExpense,
    balance,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    cleanupSubscription
  }
})
```

---

## Dependencies

### External Dependencies
- ✅ **Supabase**: PostgreSQL database, real-time subscriptions
- ✅ **Zod**: Schema validation
- ✅ **date-fns**: Date manipulation

### Internal Dependencies
- ✅ **001-authentication**: User authentication, RLS context
- ✅ **Categories**: Must exist before transactions can reference them

---

## Success Criteria

- ✅ User có thể tạo transaction thành công trong < 10 giây
- ✅ List hiển thị smooth với 1000+ transactions
- ✅ Real-time sync latency < 3 giây
- ✅ Offline queue syncs 100% successfully khi online
- ✅ Undo delete works 100% of the time within 5s window
- ✅ Zero RLS bypass (security tests pass 100%)
- ✅ Optimistic UI provides instant feedback
- ✅ Conflict resolution works correctly for concurrent edits

---

## Open Questions

1. **Virtual scrolling library**: Use @tanstack/vue-virtual or custom implementation?
   - **Recommendation**: @tanstack/vue-virtual (battle-tested)

2. **Offline queue storage**: LocalStorage or IndexedDB?
   - **Recommendation**: LocalStorage (simpler, sufficient for small queue)

3. **Swipe to delete**: Implement in MVP or defer to P2?
   - **Decision needed**: Current spec marks as "optional"

4. **Transaction attachments**: Future feature (receipts, photos)?
   - **Decision needed**: Not in current spec (v2+)

---

## Changes from Original Spec

**Additions (from Checklist Gaps):**
- ✅ Detailed field validation rules (min, max, format)
- ✅ Validation timing (blur, submit, real-time)
- ✅ Optimistic UI specifications
- ✅ Duplicate detection logic
- ✅ Idempotency with UUID
- ✅ Conflict detection and resolution
- ✅ Undo delete with 5s timeout
- ✅ Multi-device sync latency SLA
- ✅ Offline mode with queue
- ✅ Real-time subscription reconnection logic
- ✅ Responsive design breakpoints
- ✅ Keyboard navigation & accessibility
- ✅ Performance budgets (rendering, API)
- ✅ Comprehensive error handling patterns
- ✅ Security testing requirements

**No breaking changes to original US1 - only clarifications and additions.**
