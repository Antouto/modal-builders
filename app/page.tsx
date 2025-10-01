'use client'

import Collapsible from "@/components/editor/Collapsible";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { LuText } from "react-icons/lu";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getSumOfTextDisplaysInModal, modalSchema } from "@/lib/schemas";
import z from 'zod'
import LabelEditor from "@/components/editor/LabelEditor";
import { ComponentType, TextInputStyle } from "discord-api-types/v10";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import TextDisplayEditor from "@/components/editor/TextDisplayEditor";
import Modal from "@/components/preview/Modal";

function getComponentName(type: ComponentType | 19) {
  switch (type) {
    case ComponentType.TextInput:
      return "Text Input";
    case ComponentType.TextDisplay:
      return "Text Display";
    case ComponentType.StringSelect:
      return "Select Menu";
    case ComponentType.UserSelect:
      return "User Select";
    case ComponentType.ChannelSelect:
      return "Channel Select";
    case ComponentType.RoleSelect:
      return "Role Select";
    case ComponentType.MentionableSelect:
      return "User & Role Select";
    case 19:
      return "File Upload";
    default:
      return "Unknown Component";
  }
}


export default function Home() {
  const form = useForm<z.infer<typeof modalSchema>>({
    resolver: zodResolver(modalSchema),
    mode: 'onChange',
    defaultValues: {
      title: "Modal",
      custom_id: "modal",
      components: [{
        type: ComponentType.Label,
        label: "Text Input",
        component: {
          type: ComponentType.TextInput,
          custom_id: crypto.randomUUID().replace(/-/g, ''),
          style: TextInputStyle.Short,
        }
      }]
    }
  });
  const { fields, append, remove, move } = useFieldArray({ name: 'components', control: form.control });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over?.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        move(oldIndex, newIndex);
      }
    }
  }

  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-4 lg:h-[calc(100dvh)]">
        <div className="flex-1 min-w-0 lg:overflow-y-scroll p-4">
          <Form {...form}>
            <form className="space-y-2" onSubmit={(e) => e.preventDefault()}>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required count={form.watch('title')?.length ?? 0} max={45}>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="components"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required count={fields.length} max={5}>
                      Components
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-1">
                        {getSumOfTextDisplaysInModal(form.watch('components')) > 4000 && (
                          <div className="bg-[#f23f431a] border rounded-[8px] border-[#f23f43] p-[8px] text-[14px] flex gap-3 justify-between mb-1">
                            <div className="flex gap-[8px] items-center">
                              <div className="shrink-0">    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" fill="transparent"></circle>
                                <path fill="rgb(218,62,68)" fillRule="evenodd" d="M12 23a11 11 0 1 0 0-22 11 11 0 0 0 0 22Zm1.44-15.94L13.06 14a1.06 1.06 0 0 1-2.12 0l-.38-6.94a1 1 0 0 1 1-1.06h.88a1 1 0 0 1 1 1.06Zm-.19 10.69a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0Z" clipRule="evenodd"></path>
                              </svg></div>
                              <div>The sum of all text displays cannot exceed 4000.</div>
                            </div>
                          </div>
                        )}
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleDragEnd}
                        >
                          <SortableContext
                            items={fields.map((f) => f.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            {fields.map((field, index) =>
                              <Collapsible
                                key={field.id}
                                title={getComponentName(field.type === ComponentType.Label ? field.component.type : field.type)}
                                level={1}
                                hasError={!!form.formState.errors.components?.[index]}
                                onRemove={() => remove(index)}
                                dragId={field.id}
                              >
                                {(() => {
                                  switch (field.type) {
                                    case ComponentType.Label:
                                      return <LabelEditor form={form} index={index} />
                                    case ComponentType.TextDisplay:
                                      return <TextDisplayEditor form={form} index={index} />
                                    default:
                                      return <div>Unkown Component</div>
                                  }
                                })()}
                              </Collapsible>
                            )}
                          </SortableContext>
                        </DndContext>
                        <div className="flex gap-1">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="outline-none"><Button>Add<svg className="transition-transform duration-200 rotate-180 flex-shrink-0" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M12 10L8 6L4 10" stroke="#fbfbfb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align='start' className='bg-surface-higher border-border-subtle text-text-default p-2'>
                              <DropdownMenuItem
                                disabled={fields.length >= 5}
                                onClick={() => append({
                                  type: ComponentType.Label,
                                  label: "Text Input",
                                  component: {
                                    type: ComponentType.TextInput,
                                    style: TextInputStyle.Short,
                                    custom_id: crypto.randomUUID().replace(/-/g, '')
                                  }
                                })}
                              ><LuText />Text Input</DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={fields.length >= 5}
                                onClick={() => append({
                                  type: ComponentType.Label,
                                  label: "Select Menu",
                                  component: {
                                    type: ComponentType.StringSelect,
                                    custom_id: crypto.randomUUID().replace(/-/g, ''),
                                    options: [
                                      {
                                        label: "Option",
                                        value: crypto.randomUUID().replace(/-/g, '')
                                      }
                                    ]
                                  }
                                })}
                              ><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M3 9V19.4C3 19.9601 3 20.2399 3.10899 20.4538C3.20487 20.642 3.35774 20.7952 3.5459 20.8911C3.7596 21 4.0395 21 4.59846 21H15.0001M17 8L13 12L11 10M7 13.8002V6.2002C7 5.08009 7 4.51962 7.21799 4.0918C7.40973 3.71547 7.71547 3.40973 8.0918 3.21799C8.51962 3 9.08009 3 10.2002 3H17.8002C18.9203 3 19.4801 3 19.9079 3.21799C20.2842 3.40973 20.5905 3.71547 20.7822 4.0918C21.0002 4.51962 21.0002 5.07969 21.0002 6.19978L21.0002 13.7998C21.0002 14.9199 21.0002 15.48 20.7822 15.9078C20.5905 16.2841 20.2842 16.5905 19.9079 16.7822C19.4805 17 18.9215 17 17.8036 17H10.1969C9.07899 17 8.5192 17 8.0918 16.7822C7.71547 16.5905 7.40973 16.2842 7.21799 15.9079C7 15.4801 7 14.9203 7 13.8002Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>Select Menu</DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={fields.length >= 5}
                                onClick={() => append({
                                  type: ComponentType.TextDisplay,
                                  content: "Text Content",
                                })
                                }
                              ><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M10 19H12M12 19H14M12 19V5M12 5H6V6M12 5H18V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Text Display</DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={fields.length >= 5}
                                onClick={() =>
                                  append({
                                    type: ComponentType.Label,
                                    label: "User Select",
                                    component: {
                                      type: ComponentType.UserSelect,
                                      custom_id: crypto.randomUUID().replace(/-/g, '')
                                    }
                                  })
                                }
                              ><svg x="0" y="0" role="img" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M14.5 8a3 3 0 1 0-2.7-4.3c-.2.4.06.86.44 1.12a5 5 0 0 1 2.14 3.08c.01.06.06.1.12.1ZM18.44 17.27c.15.43.54.73 1 .73h1.06c.83 0 1.5-.67 1.5-1.5a7.5 7.5 0 0 0-6.5-7.43c-.55-.08-.99.38-1.1.92-.06.3-.15.6-.26.87-.23.58-.05 1.3.47 1.63a9.53 9.53 0 0 1 3.83 4.78ZM12.5 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM2 20.5a7.5 7.5 0 0 1 15 0c0 .83-.67 1.5-1.5 1.5a.2.2 0 0 1-.2-.16c-.2-.96-.56-1.87-.88-2.54-.1-.23-.42-.15-.42.1v2.1a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2.1c0-.25-.31-.33-.42-.1-.32.67-.67 1.58-.88 2.54a.2.2 0 0 1-.2.16A1.5 1.5 0 0 1 2 20.5Z"></path></svg>User Select</DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={fields.length >= 5}
                                onClick={() =>
                                  append({
                                    type: ComponentType.Label,
                                    label: "Channel Select",
                                    component: {
                                      type: ComponentType.ChannelSelect,
                                      custom_id: crypto.randomUUID().replace(/-/g, '')
                                    }
                                  })
                                }
                              ><svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="M10.99 3.16A1 1 0 1 0 9 2.84L8.15 8H4a1 1 0 0 0 0 2h3.82l-.67 4H3a1 1 0 1 0 0 2h3.82l-.8 4.84a1 1 0 0 0 1.97.32L8.85 16h4.97l-.8 4.84a1 1 0 0 0 1.97.32l.86-5.16H20a1 1 0 1 0 0-2h-3.82l.67-4H21a1 1 0 1 0 0-2h-3.82l.8-4.84a1 1 0 1 0-1.97-.32L15.15 8h-4.97l.8-4.84ZM14.15 14l.67-4H9.85l-.67 4h4.97Z" clipRule="evenodd"></path></svg>Channel Select</DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={fields.length >= 5}
                                onClick={() =>
                                  append({
                                    type: ComponentType.Label,
                                    label: "Role Select",
                                    component: {
                                      type: ComponentType.RoleSelect,
                                      custom_id: crypto.randomUUID().replace(/-/g, '')
                                    }
                                  })
                                }
                              ><svg role="img" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="M3.47 5.18c.27-.4.64-.74 1.1-.96l6.09-3.05a3 3 0 0 1 2.68 0l6.1 3.05A2.83 2.83 0 0 1 21 6.75v3.5a14.17 14.17 0 0 1-8.42 12.5c-.37.16-.79.16-1.16 0A14.18 14.18 0 0 1 3 9.77V6.75c0-.57.17-1.11.47-1.57Zm2.95 10.3A12.18 12.18 0 0 0 12 20.82a12.18 12.18 0 0 0 5.58-5.32A9.49 9.49 0 0 0 12.47 14h-.94c-1.88 0-3.63.55-5.11 1.49ZM12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" clipRule="evenodd"></path></svg>Role Select</DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={fields.length >= 5}
                                onClick={() =>
                                  append({
                                    type: ComponentType.Label,
                                    label: "User & Role Select",
                                    component: {
                                      type: ComponentType.MentionableSelect,
                                      custom_id: crypto.randomUUID().replace(/-/g, '')
                                    }
                                  })
                                }
                              ><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M15 12.0024V13C15 14.1046 15.8954 15 17 15C18.1046 15 19 14.1046 19 13V12C19 10.5021 18.5197 9.04388 17.6294 7.83935C16.7391 6.63482 15.4856 5.74757 14.0537 5.3081C12.6218 4.86863 11.0866 4.90001 9.67383 5.39771C8.26109 5.89542 7.04534 6.83359 6.20508 8.07355C5.36482 9.31351 4.94457 10.7899 5.00587 12.2865C5.06717 13.7831 5.60688 15.2207 6.54573 16.3878C7.48458 17.5549 8.77336 18.3899 10.2221 18.7704C11.6708 19.1509 13.2027 19.0566 14.5939 18.5015M15 12.0024C14.9987 13.6582 13.656 15 12 15C10.3431 15 9 13.6568 9 12C9 10.3431 10.3431 8.99999 12 8.99999C13.656 8.99999 14.9987 10.3418 15 11.9976M15 12.0024V11.9976M15 11.9976V8.99999" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>User & Role Select</DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={fields.length >= 5}
                                onClick={() =>
                                  append({
                                    type: ComponentType.Label,
                                    label: "File Upload",
                                    component: {
                                      type: 19,
                                      custom_id: crypto.randomUUID().replace(/-/g, '')
                                    }
                                  })
                                }
                              ><svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M13.82 21.7c.17.05.14.3-.04.3H6a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h7.5c.28 0 .5.22.5.5V5a5 5 0 0 0 5 5h2.5c.28 0 .5.22.5.5v2.3a.4.4 0 0 1-.68.27l-.2-.2a3 3 0 0 0-4.24 0l-4 4a3 3 0 0 0 0 4.25c.3.3.6.46.94.58Z"></path><path fill="currentColor" d="M21.66 8c.03 0 .05-.03.04-.06a3 3 0 0 0-.58-.82l-4.24-4.24a3 3 0 0 0-.82-.58.04.04 0 0 0-.06.04V5a3 3 0 0 0 3 3h2.66ZM18.3 14.3a1 1 0 0 1 1.4 0l4 4a1 1 0 0 1-1.4 1.4L20 17.42V23a1 1 0 1 1-2 0v-5.59l-2.3 2.3a1 1 0 0 1-1.4-1.42l4-4Z"></path></svg>
                                File Upload</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
          <hr className="border-border-subtle my-4" />
          <p className="font-semibold mb-1">Github</p>

          <a href="https://github.com/Antouto/modal-builders" target="_blank">
            <div className="flex gap-2 flex-wrap">
              <img alt="Star on GitHub"
                src="https://img.shields.io/github/stars/Antouto/modal-builders?style=for-the-badge&logo=github&label=Star+on+GitHub&color=007ec6&cacheBust=1" />
              <img alt="GitHub contributors"
                src="https://img.shields.io/github/contributors/Antouto/modal-builders?style=for-the-badge&color=248045" />
              <img alt="GitHub commits"
                src="https://img.shields.io/github/commit-activity/t/Antouto/modal-builders?style=for-the-badge&color=248045" />
            </div>
          </a>
          <p className="font-semibold mb-1 mt-2">Not a programmer?</p>
          <a href="https://discordforms.app" target="_blank">
            <Button variant="secondary">Create modals with Forms bot</Button>
          </a>
          <p className="font-semibold mb-1 mt-2">Need message components?</p>
          <div className="flex gap-2">
            <a href="https://discohook.app" target="_blank">
              <Button variant="secondary">Discohook</Button>
            </a>
            <a href="https://discord.builders" target="_blank">
              <Button variant="secondary">Discord.builders</Button>
            </a>
          </div>
          <hr className="border-border-subtle my-4" />

        </div>
        <div className="flex-1 min-w-0 lg:overflow-y-scroll p-4">
          <p className="font-semibold mb-1 mt-2">Preview</p>
          <div className="mb-4">
            <Modal form={form} />
          </div>

          <p className="font-semibold mb-1 mt-2">JSON</p>
          <pre className="overflow-auto lg:overflow-visible border border-border-subtle rounded-md p-4 bg-base-low">
            {JSON.stringify(form.watch(), null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
