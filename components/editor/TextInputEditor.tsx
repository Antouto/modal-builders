import React from 'react'
import { FormControl, FormField, FormItem, FormLabel } from '../ui/form'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { UseFormReturn } from 'react-hook-form'
import { modalSchema } from '@/lib/schemas'
import z from 'zod'
import { Switch } from '../ui/switch'

export default function TextInputEditor({
  form,
  index
}: {
  form: UseFormReturn<z.infer<typeof modalSchema>>
  index: number
}) {
  const style = form.watch(`components.${index}.component.style`)
  const minLength = form.watch(`components.${index}.component.min_length`)
  const maxLength = form.watch(`components.${index}.component.max_length`)

  return (
    <>
      <div className="flex gap-2">
        <FormField
          control={form.control}
          name={`components.${index}.component.style` as const}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Multiline
              </FormLabel>
              <FormControl>
                <Switch
                  onCheckedChange={(checked) => field.onChange(checked ? 2 : 1)}
                  checked={field.value === 2}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`components.${index}.component.required` as const}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Required
              </FormLabel>
              <FormControl>
                <Switch
                  checked={field.value !== false}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      form.setValue(`components.${index}.component.required`, undefined as unknown as boolean, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
                    } else {
                      field.onChange(false)
                    }
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <FormField
          control={form.control}
          name={`components.${index}.component.min_length` as const}
          render={({ field: inputField }) => (
            <FormItem className="flex items-center space-x-2 flex-1 min-w-[273px]">
              <div className="w-full">
                <FormLabel
                  count={typeof inputField.value === 'number' ? inputField.value : 0}
                  min={0}
                  max={4000}
                >
                  Min Length
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={4000}
                    placeholder="1"
                    {...inputField}
                    value={inputField.value === undefined ? '' : inputField.value}
                    onChange={e => {
                      const value = e.target.value
                      if (value === '') {
                        form.setValue(`components.${index}.component.min_length`, undefined as unknown as number, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
                      } else {
                        inputField.onChange(+value)
                      }
                      form.trigger(`components.${index}.component.max_length`)
                      form.trigger(`components.${index}.component.value`)
                    }}
                  />
                </FormControl>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`components.${index}.component.max_length` as const}
          render={({ field: inputField }) => (
            <FormItem className="flex items-center space-x-2 flex-1 min-w-[273px]">
              <div className="w-full">
                <FormLabel
                  count={typeof inputField.value === 'number' ? inputField.value : 0}
                  min={1}
                  max={4000}
                >
                  Max Length
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={4000}
                    placeholder="4000"
                    {...inputField}
                    value={inputField.value === undefined ? '' : inputField.value}
                    onChange={e => {
                      const value = e.target.value
                      if (value === '') {
                        form.setValue(`components.${index}.component.max_length`, undefined as unknown as number, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
                      } else {
                        inputField.onChange(+value)
                      }
                      form.trigger(`components.${index}.component.min_length`)
                      form.trigger(`components.${index}.component.value`)
                    }}
                  />
                </FormControl>
              </div>
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name={`components.${index}.component.placeholder` as const}
        render={({ field: inputField }) => (
          <FormItem className="w-0 min-w-full">
            <div className="w-0 min-w-full">
              <FormLabel
                count={(inputField.value || '').length}
                max={100}
              >
                Placeholder
              </FormLabel>
              <FormControl>
                {style === 2 ? (
                  <Textarea
                    className="w-0 min-w-full"
                    maxLength={100}
                    {...inputField}
                    value={inputField.value || ''}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value === '') {
                        form.setValue(`components.${index}.component.placeholder`, undefined as unknown as string, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
                      } else {
                        inputField.onChange(value)
                      }
                    }}
                  />
                ) : (
                  <Input
                    className="w-0 min-w-full"
                    maxLength={100}
                    {...inputField}
                    value={inputField.value || ''}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value === '') {
                        form.setValue(`components.${index}.component.placeholder`, undefined as unknown as string, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
                      } else {
                        inputField.onChange(value)
                      }
                    }}
                  />
                )}
              </FormControl>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`components.${index}.component.value` as const}
        render={({ field: inputField }) => (
          <FormItem className="w-0 min-w-full">
            <div className="w-0 min-w-full">
              <FormLabel
                count={(inputField.value || '').length}
                min={typeof minLength === 'number' ? minLength : 1}
                max={typeof maxLength === 'number' ? maxLength : 4000}
              >
                Pre-filled value
              </FormLabel>
              <FormControl>
                {style === 2 ? (
                  <Textarea
                    className="w-0 min-w-full"
                    {...inputField}
                    value={inputField.value || ''}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value === '') {
                        form.setValue(`components.${index}.component.value`, undefined as unknown as string, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
                      } else {
                        inputField.onChange(value)
                      }
                    }}
                  />
                ) : (
                  <Input
                    className="w-0 min-w-full"
                    {...inputField}
                    value={inputField.value || ''}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value === '') {
                        form.setValue(`components.${index}.component.value`, undefined as unknown as string, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
                      } else {
                        inputField.onChange(value)
                      }
                    }}
                  />
                )}
              </FormControl>
            </div>
          </FormItem>
        )}
      />
    </>
  )
}


