import { modalSchema } from '@/lib/schemas'
import { UseFormReturn } from 'react-hook-form'
import z from 'zod'
import { FormControl, FormField, FormItem, FormLabel } from '../ui/form'
import { Input } from '../ui/input'
import { Switch } from '../ui/switch'
import { ComponentType, ChannelType } from 'discord-api-types/v10'
import SelectOptionsEditor from './SelectOptionsEditor'
import SelectDefaultValuesEditor from './SelectDefaultValuesEditor'
import { FormReactSelect } from './FormReactSelect'
import { getChannelIcon } from '@/lib/utils'


export default function SelectMenuEditor({
  form,
  index
}: {
  form: UseFormReturn<z.infer<typeof modalSchema>>
  index: number
}) {
  const type = form.watch(`components.${index}.component.type`)
  
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
                  max={type === ComponentType.StringSelect ? Math.min(25, form.watch(`components.${index}.component.options`)?.length ?? 25) : 25}
                >
                  Min Values
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={25}
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
                  max={type === ComponentType.StringSelect ? Math.min(25, form.watch(`components.${index}.component.options`)?.length ?? 25) : 25}
                >
                  Max Values
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    placeholder="1"
                    max={type === ComponentType.StringSelect ? Math.min(25, form.watch(`components.${index}.component.options`)?.length ?? 25) : 25}
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

      <FormField
        control={form.control}
        name={`components.${index}.component.placeholder` as const}
        render={({ field }) => (
          <FormItem className="w-0 min-w-full">
            <FormLabel count={field.value?.length ?? 0} max={150}>Placeholder</FormLabel>
            <FormControl>
              <Input
                className="w-0 min-w-full"
                placeholder="Make a selection"
                {...field}
                value={field.value || ''}
                onChange={e => {
                  const value = e.target.value;
                  if (value === '') {
                    form.setValue(`components.${index}.component.placeholder`, undefined as unknown as string, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                  } else {
                    field.onChange(value);
                  }
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {type === ComponentType.ChannelSelect && (
        <FormField
          control={form.control}
          name={`components.${index}.component.channel_types`}
          render={({ field }) => {
            const channelTypeOptions = [
              { label: "Text", value: 0 },
              { label: "Voice", value: 2 },
              { label: "Category", value: 4 },
              { label: "Announcement", value: 5 },
              { label: "Announcement Thread", value: 10 },
              { label: "Public Thread", value: 11 },
              { label: "Private Thread", value: 12 },
              { label: "Stage", value: 13 },
              { label: "Directory", value: 14 },
              { label: "Forum", value: 15 },
              { label: "Media", value: 16 },
            ];

            return (
              <FormItem>
                <FormLabel>Channel Types</FormLabel>
                <FormControl>
                  <FormReactSelect
                    className="w-full"
                    onChange={(options: { label: string, value: number }[] | null) => {
                      const values = Array.isArray(options)
                        ? options.map((opt) => opt.value)
                        : [];
                      if (values.length === 0) {
                        form.setValue(`components.${index}.component.channel_types`, undefined as unknown as number[], { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                      } else {
                        field.onChange(values);
                      }
                    }}
                    value={Array.isArray(field.value)
                      ? field.value.map((v: number) => channelTypeOptions.find(o => o.value === v)!)
                      : []}
                    isMulti
                    key={`channel-types-select-${index}`}
                    isClearable={true}
                    isSearchable={true}
                    placeholder={<span>All channel types</span>}
                    noOptionsMessage={() => <span>No results found</span>}
                    name="Select channel types"
                    formatOptionLabel={({ label, value }: { label: string, value: number }) => (
                      <div
                        style={{ display: "flex", alignItems: "center", gap: "8px" }}
                      >
                        <span>{getChannelIcon(value)}</span>
                        <span>{label}</span>
                      </div>
                    )}
                    options={channelTypeOptions}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                </FormControl>
              </FormItem>
            );
          }}
        />
      )}

      {(()=>{
        switch (type) {
          case ComponentType.StringSelect:
            return <SelectOptionsEditor form={form} index={index} />
          case ComponentType.UserSelect:
          case ComponentType.ChannelSelect:
          case ComponentType.RoleSelect:
          case ComponentType.MentionableSelect:
            return <SelectDefaultValuesEditor form={form} index={index} />
        }
      })()}
    </>
  )
}
