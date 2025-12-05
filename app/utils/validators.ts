import { z } from 'zod'
import { MAX_AMOUNT } from './constants'

export const TransactionSchema = z.object({
  date: z.string().min(1, 'Ngày không được để trống'),
  type: z.enum(['income', 'expense'], {
    errorMap: () => ({ message: 'Loại giao dịch không hợp lệ' })
  }),
  amount: z
    .number({ invalid_type_error: 'Số tiền phải là số' })
    .positive('Số tiền phải lớn hơn 0')
    .max(MAX_AMOUNT, `Số tiền không được vượt quá ${MAX_AMOUNT.toLocaleString('vi-VN')}`),
  categoryId: z.string().min(1, 'Vui lòng chọn danh mục'),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export type TransactionFormData = z.infer<typeof TransactionSchema>

export function validateTransaction(data: unknown) {
  return TransactionSchema.safeParse(data)
}
