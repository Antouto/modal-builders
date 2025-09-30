import React from 'react'
import { FormControl, FormField, FormItem, FormLabel } from '../ui/form'
import { Input } from '../ui/input'
import { Switch } from '../ui/switch'
import { UseFormReturn } from 'react-hook-form'
import { modalSchema } from '@/lib/schemas'
import z from 'zod'

export default function FileUploadEditor({
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
                    
                    // If turning required on and min_values is 0, set min_values to 1
                    const currentMinValues = form.getValues(`components.${index}.component.min_values`);
                    if (currentMinValues === 0) {
                      form.setValue(`components.${index}.component.min_values`, 1);
                    }
                  } else {
                    field.onChange(false)
                  }
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />
      <div className="flex flex-wrap gap-2">
        <FormField
          control={form.control}
          name={`components.${index}.component.min_values` as const}
          render={({ field: inputField }) => (
            <FormItem className="flex items-center space-x-2 flex-1 min-w-[273px]">
              <div className="w-full">
                <FormLabel
                  count={typeof inputField.value === 'number' ? inputField.value : 0}
                  min={0}
                  max={10}
                >
                  Min Values
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    placeholder="1"
                    {...inputField}
                    value={inputField.value === undefined ? '' : inputField.value}
                    onChange={e => {
                      const value = e.target.value;
                      if (value === '') {
                        form.setValue(`components.${index}.component.min_values`, undefined as unknown as number, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                      } else {
                        const newValue = +value;
                        inputField.onChange(newValue);

                        // If setting min_values to 0 and required is true, set required to false
                        if (newValue === 0) {
                          const currentRequired = form.getValues(`components.${index}.component.required`);
                          if (currentRequired !== false) {
                            form.setValue(`components.${index}.component.required`, false);
                          }
                        }
                      }

                      // Trigger validation on the max_values field as well
                      form.trigger(`components.${index}.component.max_values`);
                    }}
                  />
                </FormControl>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`components.${index}.component.max_values` as const}
          render={({ field: inputField }) => (
            <FormItem className="flex items-center space-x-2 flex-1 min-w-[273px]">
              <div className="w-full">
                <FormLabel
                  count={typeof inputField.value === 'number' ? inputField.value : 0}
                  min={1}
                  max={10}
                >
                  Max Values
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    placeholder="1"
                    max={10}
                    {...inputField}
                    value={inputField.value === undefined ? '' : inputField.value}
                    onChange={e => {
                      const value = e.target.value;
                      if (value === '') {
                        form.setValue(`components.${index}.component.max_values`, undefined as unknown as number, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                      } else {
                        inputField.onChange(+value);
                      }
                      // Trigger validation on the min_values field as well
                      form.trigger(`components.${index}.component.min_values`);
                    }}
                  />
                </FormControl>
              </div>
            </FormItem>
          )}
        />
      </div>
    </>
  )
}