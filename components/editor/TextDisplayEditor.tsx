import { UseFormReturn } from 'react-hook-form'
import { modalSchema } from '@/lib/schemas'
import z from 'zod'
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'

export default function TextDisplayEditor({
  form,
  index
}: {
  form: UseFormReturn<z.infer<typeof modalSchema>>
  index: number
}) {
  return (
    <FormField
      control={form.control}
      name={`components.${index}.content`}
      render={({ field }) => (
        <FormItem>
          <FormLabel required count={form.watch(`components.${index}.content`)?.length ?? 0}>Content</FormLabel>
          <FormControl>
            <Textarea 
              {...field} 
              onChange={(e) => {
                field.onChange(e);
                form.trigger('components');
              }}
            />
          </FormControl>
        </FormItem>
      )}
    />
  )
}
