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
import { Switch } from '@/components/ui/switch'
import Collapsible from './Collapsible'
import { PopoutEmojiPicker } from './EmojiPicker'
import { APIMessageComponentEmoji } from 'discord-api-types/v10'
import { Label } from '../ui/label'

export default function SelectOptionsEditor({
  form,
  index
}: {
  form: UseFormReturn<z.infer<typeof modalSchema>>
  index: number
}) {
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: `components.${index}.component.options`
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

  function handleDefaultChange(selectedIndex: number, isDefault: boolean) {
    const fieldPath = `components.${index}.component.options.${selectedIndex}.default` as const
    if (isDefault) {
      form.setValue(fieldPath, true)
    } else {
      // If unchecking, omit the field by setting to undefined
      form.setValue(fieldPath, undefined as unknown as boolean)
    }
    // Trigger validation on options to update refinement errors
    form.trigger(`components.${index}.component.options`)
  }

  // Check if number of default options exceeds max_values
  const options = form.watch(`components.${index}.component.options`) || []
  const maxValues = form.watch(`components.${index}.component.max_values`)

  return (
    <>
      <FormField
        control={form.control}
        name={`components.${index}.component.options`}
        render={() => (
          <FormItem>
            <FormLabel className="mt-1" count={fields.length} min={1} max={25}>Options</FormLabel>
            <FormControl>
              <div>
                {((options.filter(opt => opt?.default === true).length) > (maxValues ?? 1)) && (
                  <div className="bg-[#f23f431a] border rounded-[8px] border-[#f23f43] p-[8px] text-[14px] flex gap-3 justify-between mb-1">
                    <div className="flex gap-[8px] items-center">
                      <div className="shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" fill="transparent"></circle>
                          <path fill="rgb(218,62,68)" fillRule="evenodd" d="M12 23a11 11 0 1 0 0-22 11 11 0 0 0 0 22Zm1.44-15.94L13.06 14a1.06 1.06 0 0 1-2.12 0l-.38-6.94a1 1 0 0 1 1-1.06h.88a1 1 0 0 1 1 1.06Zm-.19 10.69a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0Z" clipRule="evenodd"></path>
                        </svg>
                      </div>
                      <div>Cannot have more default options than max values.</div>
                    </div>
                  </div>
                )}
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
            {fields.map((field, optionIndex) => {
              const optionLabel = form.watch(`components.${index}.component.options.${optionIndex}.label`)
              const title = `Option ${optionIndex + 1}${optionLabel ? ` - ${optionLabel}` : ''}`
              // @ts-ignore - accessing nested errors
              const hasError = !!form.formState.errors.components?.[index]?.component?.options?.[optionIndex]
              
              return (
                <Collapsible
                  key={field.id}
                  title={title}
                  level={2}
                  hasError={hasError}
                  onRemove={() => {
                    if (fields.length === 1) {
                      form.setValue(`components.${index}.component.options`, [{
                        label: '',
                        value: '',
                        description: '',
                        emoji: {
                          name: '',
                          id: ''
                        }
                      }])
                      form.trigger(`components.${index}.component.options`)
                    } else {
                      remove(optionIndex)
                      form.trigger(`components.${index}.component.options`)
                      form.trigger(`components.${index}.component.min_values`)
                      form.trigger(`components.${index}.component.max_values`)
                    }
                  }}
                  dragId={field.id}
                >
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-shrink-0 space-y-2">
                        <Label>Emoji</Label>
                        <PopoutEmojiPicker
                          emoji={form.watch(`components.${index}.component.options.${optionIndex}.emoji`) as APIMessageComponentEmoji | undefined}
                          setEmoji={(emoji) => {
                            form.setValue(
                              `components.${index}.component.options.${optionIndex}.emoji`,
                              emoji || { name: '', id: '' },
                              { shouldValidate: true, shouldDirty: true }
                            )
                          }}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name={`components.${index}.component.options.${optionIndex}.label`}
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel required count={field.value?.length || 0} max={100}>Label</FormLabel>
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
                    
                    
                    <FormField
                      control={form.control}
                      name={`components.${index}.component.options.${optionIndex}.description`}
                      render={({ field }) => (
                        <FormItem className="w-0 min-w-full">
                          <FormLabel count={field.value?.length || 0} max={100}>Description</FormLabel>
                          <FormControl>
                            <Input
                              className="w-0 min-w-full"
                              {...field}
                              value={field.value || ''}
                              onChange={e => {
                                const value = e.target.value
                                if (value === '') {
                                  form.setValue(`components.${index}.component.options.${optionIndex}.description`, undefined as unknown as string, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
                                } else {
                                  field.onChange(value)
                                }
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`components.${index}.component.options.${optionIndex}.default`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default selection</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value === true}
                              onCheckedChange={(checked) => {
                                handleDefaultChange(optionIndex, checked)
                              }}
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
                label: 'Option',
                value: crypto.randomUUID().replace(/-/g, ''),
                description: '',
                emoji: {
                  name: '',
                  id: ''
                }
              })
              form.trigger(`components.${index}.component.options`)
              form.trigger(`components.${index}.component.min_values`)
              form.trigger(`components.${index}.component.max_values`)
            }}
          >
            Add Option
          </Button>
        </div>
      </DndContext>
              </div>
            </FormControl>
          </FormItem>
        )}
      />
    </>
  )
}