import React from 'react'
import { FormControl, FormField, FormItem, FormLabel } from '../ui/form'
import { Input } from '../ui/input'
import { UseFormReturn } from 'react-hook-form'
import { modalSchema } from '@/lib/schemas'
import z from 'zod'
import Collapsible from './Collapsible'
import TextInputEditor from './TextInputEditor'
import { ComponentType } from 'discord-api-types/v10'
import SelectMenuEditor from './SelectMenuEditor'
import FileUploadEditor from './FileUploadEditor'

export default function LabelEditor({
  form,
  index
}: {
  form: UseFormReturn<z.infer<typeof modalSchema>>
  index: number
}) {
  return (
    <>
      <FormField
        control={form.control}
        name={`components.${index}.label` as const}
        render={({ field }) => (
          <FormItem>
            <FormLabel required count={form.watch(`components.${index}.label`)?.length ?? 0} max={45}>Label</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`components.${index}.description` as const}
        render={({ field }) => (
          <FormItem>
            <FormLabel count={form.watch(`components.${index}.description`)?.length ?? 0} max={100}>Description</FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ''}
                onChange={e => {
                  const value = e.target.value
                  if (value === '') {
                    form.setValue(`components.${index}.description`, undefined, { shouldValidate: true })
                  } else {
                    field.onChange(e)
                  }
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />
      {(() => {
        switch (form.watch(`components.${index}.component.type`)) {
          case ComponentType.TextInput:
            return <TextInputEditor form={form} index={index} />
          case ComponentType.StringSelect:
          case ComponentType.UserSelect:
          case ComponentType.ChannelSelect:
          case ComponentType.RoleSelect:
          case ComponentType.MentionableSelect:
            return <SelectMenuEditor form={form} index={index} />
          case 19:
            return <FileUploadEditor form={form} index={index} />
          default:
            return <div>Unkown Component</div>
        }
      })()}
    </>
  )
}
