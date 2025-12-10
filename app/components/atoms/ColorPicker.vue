<script setup lang="ts">
interface Props {
  modelValue: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const predefinedColors = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#EAB308', // Yellow
  '#84CC16', // Lime
  '#22C55E', // Green
  '#10B981', // Emerald
  '#14B8A6', // Teal
  '#06B6D4', // Cyan
  '#0EA5E9', // Sky
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#A855F7', // Purple
  '#D946EF', // Fuchsia
  '#EC4899', // Pink
  '#F43F5E', // Rose
  '#64748B', // Slate
]

const selectColor = (color: string) => {
  emit('update:modelValue', color)
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-lg border-2 border-slate-300 dark:border-zinc-600"
        :style="{ backgroundColor: modelValue }" />
      <input type="text" :value="modelValue"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        class="flex-1 px-3 py-2 border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        placeholder="#000000" />
    </div>

    <div class="grid grid-cols-9 gap-2">
      <button v-for="color in predefinedColors" :key="color" type="button" @click="selectColor(color)"
        class="w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110" :class="[
          modelValue === color
            ? 'border-slate-900 dark:border-white ring-2 ring-slate-900 dark:ring-white ring-offset-2 dark:ring-offset-zinc-900'
            : 'border-slate-300 dark:border-zinc-600'
        ]" :style="{ backgroundColor: color }" :title="color" />
    </div>
  </div>
</template>
