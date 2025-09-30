'use client'

import { modalSchema } from '@/lib/schemas'
import { useFieldArray, UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import z from 'zod'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ComponentType } from 'discord-api-types/v10'
import Collapsible from './Collapsible'

export default function SelectDefaultValuesEditor({
  form,
  index
}: {
  form: UseFormReturn<z.infer<typeof modalSchema>>
  index: number
}) {
  const type = form.watch(`components.${index}.component.type`) as ComponentType.UserSelect | ComponentType.ChannelSelect | ComponentType.RoleSelect | ComponentType.MentionableSelect
  
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: `components.${index}.component.default_values`
  })

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id)
      const newIndex = fields.findIndex((field) => field.id === over?.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        move(oldIndex, newIndex)
      }
    }
  }

  return (
    <>
      <p className="mt-1 font-semibold">Default Values</p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-2">
          <SortableContext
            items={fields.map(field => field.id)}
            strategy={verticalListSortingStrategy}
          >
            {fields.map((field, defaultValueIndex) => {
              // @ts-ignore - accessing nested errors
              const hasError = !!form.formState.errors.components?.[index]?.component?.default_values?.[defaultValueIndex]
              
              return (
                <Collapsible
                  key={field.id}
                  title={`Default Value ${defaultValueIndex + 1}`}
                  level={2}
                  hasError={hasError}
                  onRemove={() => {
                    remove(defaultValueIndex)
                    // If this was the last item, delete the empty array from form state
                    if (fields.length === 1) {
                      form.setValue(`components.${index}.component.default_values`, undefined as unknown as any[], { shouldValidate: true, shouldDirty: true, shouldTouch: true })
                    }
                    // Trigger validation on max_values since the number of default values changed
                    form.trigger(`components.${index}.component.max_values`)
                    form.trigger(`components.${index}.component.min_values`)
                  }}
                  dragId={field.id}
                >
                  <div className="space-y-2">
                    {type === ComponentType.MentionableSelect && (
                      <FormField
                        control={form.control}
                        name={`components.${index}.component.default_values.${defaultValueIndex}.type`}
                        render={({ field }) => {
                          const selected = field.value
                          return (
                            <FormItem>
                              <FormLabel>Type</FormLabel>
                              <FormControl>
                                <div className="bg-base-lower font-medium text-[14px] flex p-[4px] rounded-[8px] gap-[8px] border border-border-faint select-none">
                                  {/* User Option */}
                                  <div
                                    className={
                                      `basis-full flex justify-center items-center rounded-[8px] cursor-pointer transition-colors ` +
                                      (selected === "user"
                                        ? 'border border-border-normal bg-background-mod-normal text-[#fbfbfb]'
                                        : 'border border-transparent hover:bg-background-mod-subtle text-[#aaaab1]')
                                    }
                                    onClick={() => field.onChange("user")}
                                    tabIndex={0}
                                    role="button"
                                    aria-pressed={selected === "user"}
                                  >
                                    User
                                  </div>
                                  {/* Role Option */}
                                  <div
                                    className={
                                      `basis-full flex justify-center items-center rounded-[8px] cursor-pointer transition-colors ` +
                                      (selected === "role"
                                        ? 'border border-border-normal bg-background-mod-normal text-[#fbfbfb]'
                                        : 'border border-transparent hover:bg-background-mod-subtle text-[#aaaab1]')
                                    }
                                    onClick={() => field.onChange("role")}
                                    tabIndex={0}
                                    role="button"
                                    aria-pressed={selected === "role"}
                                  >
                                    Role
                                  </div>
                                </div>
                              </FormControl>
                            </FormItem>
                          )
                        }}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name={`components.${index}.component.default_values.${defaultValueIndex}.id`}
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel required>
                            {(() => {
                              const defaultValueType = form.watch(`components.${index}.component.default_values.${defaultValueIndex}.type`)
                              switch (defaultValueType) {
                                case "user":
                                  return "User ID"
                                case "channel":
                                  return "Channel ID"
                                case "role":
                                  return "Role ID"
                                default:
                                  return "ID"
                              }
                            })()}
                          </FormLabel>
                          <FormControl>
                            <Input
                              className="w-full"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </Collapsible>
              )
            })}
          </SortableContext>
          <Button
            type="button"
            disabled={fields.length >= 25}
            onClick={() => {
              append({
                id: "",
                type: type === ComponentType.ChannelSelect 
                  ? "channel" 
                  : type === ComponentType.RoleSelect 
                  ? "role" 
                  : "user", // For UserSelect and MentionableSelect, default to "user"
              })
              form.trigger(`components.${index}.component.default_values.${fields.length}.id`)
              // Trigger validation on max_values since the number of default values changed
              form.trigger(`components.${index}.component.max_values`)
              form.trigger(`components.${index}.component.min_values`)
            }}
          >
            Add Default Value
          </Button>
        </div>
      </DndContext>
    </>
  )
}