import { z } from 'zod'
import { MAX_AMOUNT, MIN_AMOUNT } from './constants'

export const TransactionSchema = z.object({
  date: z.date({ required_error: 'Ngày không được để trống' }),
  type: z.enum(['income', 'expense'], {
    errorMap: () => ({ message: 'Loại giao dịch không hợp lệ' })
  }),
  amount: z
    .number({ invalid_type_error: 'Số tiền phải là số' })
    .min(MIN_AMOUNT, 'Số tiền phải lớn hơn 0')
    .max(MAX_AMOUNT, `Số tiền không được vượt quá ${MAX_AMOUNT.toLocaleString('vi-VN')}`),
  category: z.string({ required_error: 'Vui lòng chọn danh mục' })
    .min(1, 'Vui lòng chọn danh mục')
    .uuid('Danh mục không hợp lệ'),
  description: z.string().max(500, 'Mô tả tối đa 500 ký tự').optional(),
  tags: z
    .array(z.string().min(1, 'Tag không được để trống').max(50, 'Tag tối đa 50 ký tự'))
    .max(10, 'Tối đa 10 tag')
    .optional(),
})

export type TransactionFormData = z.infer<typeof TransactionSchema>

export function validateTransaction(data: unknown) {
  return TransactionSchema.safeParse(data)
}
