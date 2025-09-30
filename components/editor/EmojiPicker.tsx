'use client'

import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import emojiData, {
  type Category,
  type Emoji,
  type EmojiMartData,
  type Skin,
} from '@emoji-mart/data'
import { type APIMessageComponentEmoji } from 'discord-api-types/v10'
import { isSnowflake } from 'discord-snowflake'
import { memo, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Twemoji } from './Twemoji'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type SelectedEmoji = Omit<Emoji, 'skins'> & { skin: Skin }

const findCustomEmojiSubstring = (
  text: string
): { id: string; name?: string; animated?: boolean } | undefined => {
  try {
    if (isSnowflake(text) && text.length > 17) {
      return { id: text }
    }
  } catch {}

  const wholeMatch = /<(a)?:(\w+):(\d+)>/g.exec(text)
  if (wholeMatch) {
    return {
      id: wholeMatch[3],
      name: wholeMatch[2],
      animated: Boolean(wholeMatch[1]),
    }
  }

  const urlMatch =
    /^https:\/\/(?:cdn|media)\.discordapp\.(?:com|net)\/emojis\/(\d+)(?:\.(\w+))?/.exec(
      text
    )
  if (urlMatch) {
    return {
      id: urlMatch[1],
      animated: urlMatch[2] === 'gif',
    }
  }
}

interface PickerProps {
  id: string
  onEmojiClick: (
    emoji: SelectedEmoji,
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void
  className?: string
}

// Emoji category icons (simplified SVG icons)
const StarIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

const EmojiIconPeople = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="8" r="4" />
    <path d="M12 14c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z" />
  </svg>
)

const EmojiIconNature = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EmojiIconFood = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 3l-1.5 1.5L18 6V3zm-1.5 9c-1.4 0-2.5-1.1-2.5-2.5V4H2v16h20V4h-3.5v5.5c0 1.4-1.1 2.5-2.5 2.5z" />
  </svg>
)

const EmojiIconActivities = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="10" />
  </svg>
)

const EmojiIconTravel = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
  </svg>
)

const EmojiIconObjects = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM3 21.5h8v-8H3v8zm2-6h4v4H5v-4z" />
  </svg>
)

const EmojiIconSymbols = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11 7h2v2h-2V7zm0 4h2v6h-2v-6zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
  </svg>
)

const EmojiIconFlags = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6h-5.6z" />
  </svg>
)

const PaperclipIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z" />
  </svg>
)

const categoryToIcon: Record<string, React.FC<{ className?: string }>> = {
  custom: PaperclipIcon,
  people: EmojiIconPeople,
  nature: EmojiIconNature,
  foods: EmojiIconFood,
  activity: EmojiIconActivities,
  places: EmojiIconTravel,
  objects: EmojiIconObjects,
  symbols: EmojiIconSymbols,
  flags: EmojiIconFlags,
}

const CategoryIconButton: React.FC<{
  categoryId: string
  id: string
}> = ({ categoryId, id }) => {
  const Icon = categoryToIcon[categoryId]
  if (!Icon) return null

  return (
    <button
      type="button"
      className="block mx-auto p-1 hover:bg-background-mod-subtle rounded transition"
      onClick={() => {
        const sectionHeader = document.getElementById(`${id}-${categoryId}`)
        if (sectionHeader) {
          sectionHeader.scrollIntoView({ behavior: 'smooth' })
        }
      }}
    >
      <Icon className="w-5 h-5" />
    </button>
  )
}

const GridEmoji: React.FC<{
  emoji: SelectedEmoji
  onEmojiClick: (
    e: SelectedEmoji,
    ev: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void
  setHoverEmoji: (e: SelectedEmoji) => void
}> = ({ emoji, onEmojiClick, setHoverEmoji }) => (
  <button
    type="button"
    className="rounded p-1 h-11 w-11 hover:bg-background-mod-subtle transition"
    onClick={(ev) => onEmojiClick(emoji, ev)}
    onMouseOver={() => setHoverEmoji(emoji)}
    onFocus={() => setHoverEmoji(emoji)}
  >
    <Twemoji
      emoji={emoji.skin.native}
      className="h-full w-full"
      title={emoji.id}
      loading="lazy"
    />
  </button>
)

const EmojiPicker_: React.FC<PickerProps> = ({
  id,
  onEmojiClick,
  className,
}) => {
  const [hoverEmoji, setHoverEmoji] = useState<SelectedEmoji>()
  const [query, setQuery] = useState('')
  const [skinTone, setSkinTone] = useState<number | undefined>()
  const [inputtingCustom, setInputtingCustom] = useState(false)
  const [inputtingCustomDetails, setInputtingCustomDetails] =
    useState<ReturnType<typeof findCustomEmojiSubstring>>()

  // Load skin tone from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('emoji-skin-tone')
    if (saved) {
      setSkinTone(parseInt(saved))
    }
  }, [])

  // Save skin tone to localStorage
  const updateSkinTone = (newTone: number | undefined) => {
    setSkinTone(newTone)
    if (newTone === undefined) {
      localStorage.removeItem('emoji-skin-tone')
    } else {
      localStorage.setItem('emoji-skin-tone', newTone.toString())
    }
  }

  const data = structuredClone(emojiData as EmojiMartData)
  const categories: Category[] = [
    {
      id: 'custom',
      emojis: [],
    },
    ...data.categories,
  ]

  return (
    <div
      className={cn(
        'text-text-default rounded-[8px] bg-surface-high w-[385px] h-80 border border-border-subtle shadow-shadow-high flex flex-col',
        className
      )}
    >
      {inputtingCustom ? (
        <div className="h-80 overflow-y-auto">
          <div className="p-4">
            <div className="grow">
              <label className="text-sm font-medium mb-1 block">Emoji ID</label>
              <Input
                className="w-full"
                onChange={({ currentTarget }) => {
                  setInputtingCustomDetails(
                    findCustomEmojiSubstring(currentTarget.value)
                  )
                }}
              />
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Preview</p>
              {inputtingCustomDetails ? (
                <img
                  src={`https://cdn.discordapp.com/emojis/${inputtingCustomDetails.id}.${inputtingCustomDetails.animated ? 'gif' : 'webp'}`}
                  className="w-14 h-14"
                  alt={inputtingCustomDetails.name}
                />
              ) : (
                <div className="w-14 h-14 bg-background-mod-subtle rounded-lg" />
              )}
            </div>
            <div className="mt-4">
              <p className="font-medium mb-2">How to find custom emoji ID:</p>
              <ol className="list-decimal list-inside text-sm space-y-1">
                <li>Send the emoji in Discord</li>
                <li>Right-click and copy the emoji</li>
                <li>Paste it here</li>
              </ol>
            </div>
          </div>
          <div className="sticky bottom-0 left-0 w-full rounded-b-lg bg-surface-high border-t border-border-subtle flex items-end px-4 py-2">
            <Button
              variant="secondary"
              className="ml-auto"
              onClick={() => {
                setInputtingCustom(false)
                setInputtingCustomDetails(undefined)
              }}
            >
              Cancel
            </Button>
            <Button
              className="ml-2"
              disabled={!inputtingCustomDetails}
              onClick={(ev) => {
                if (inputtingCustomDetails) {
                  onEmojiClick(
                    {
                      id: inputtingCustomDetails.id,
                      name: inputtingCustomDetails.name ?? 'unknown',
                      keywords: [
                        'discord',
                        inputtingCustomDetails.animated ? 'animated' : 'static',
                      ],
                      skin: {
                        native: inputtingCustomDetails.id,
                        unified: '',
                      },
                      version: 1,
                    },
                    ev
                  )
                  setInputtingCustom(false)
                  setInputtingCustomDetails(undefined)
                }
              }}
            >
              Save
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="p-2 shadow border-b border-b-border-faint flex items-center gap-3">
        <div className="grow">
          <Input
            className="w-full h-8"
            placeholder="Find the perfect emoji"
            onChange={(e) =>
              setQuery(e.currentTarget.value.toLowerCase().trim())
            }
          />
        </div>
        <button
          type="button"
          className="shrink-0"
          onClick={() => {
            if (skinTone === undefined) {
              updateSkinTone(0)
            } else if (skinTone < 4) {
              updateSkinTone((skinTone + 1) as typeof skinTone)
            } else {
              updateSkinTone(undefined)
            }
          }}
        >
          <Twemoji
            emoji={
              skinTone === 0
                ? '👏🏻'
                : skinTone === 1
                  ? '👏🏼'
                  : skinTone === 2
                    ? '👏🏽'
                    : skinTone === 3
                      ? '👏🏾'
                      : skinTone === 4
                        ? '👏🏿'
                        : '👏'
            }
            className="h-6 w-6"
            title="Set skin tone"
          />
        </button>
      </div>
      <div className="flex grow h-full overflow-hidden">
        <div className="w-10 shrink-0 bg-base-lowest border-r border-border-subtle overflow-y-auto h-full rounded-bl-lg scrollbar-none space-y-1 p-1 py-2 flex flex-col">
          {categories
            .filter((c) => c.id === 'custom' || c.emojis.length > 0)
            .map((category) => (
              <CategoryIconButton
                key={`emoji-category-${id}-${category.id}-icon`}
                categoryId={category.id}
                id={id}
              />
            ))}
        </div>
        <div className="overflow-y-auto flex flex-col grow select-none">
          <div className="grow px-1.5 pb-1">
            {query
              ? Object.values(data.emojis)
                  .filter(
                    (e) =>
                      e.id.includes(query) ||
                      e.keywords
                        .map((k) => k.includes(query))
                        .includes(true)
                  )
                  .map(({ skins, ...emoji }) => {
                    const skin =
                      skins[skinTone === undefined ? 0 : skinTone + 1] ??
                      skins[0]
                    const selected: SelectedEmoji = { ...emoji, skin }

                    return (
                      <GridEmoji
                        key={`emoji-search-${emoji.id}`}
                        emoji={selected}
                        onEmojiClick={onEmojiClick}
                        setHoverEmoji={setHoverEmoji}
                      />
                    )
                  })
              : categories
                  .filter((c) => c.id === 'custom' || c.emojis.length > 0)
                  .map((category) => (
                    <div
                      key={`emoji-category-${category.id}-body`}
                      className="pt-3 first:pt-1"
                    >
                      <div
                        id={`${id}-${category.id}`}
                        className="uppercase text-xs font-semibold pt-1 mb-1 ml-1 flex"
                      >
                        {(() => {
                          const Icon = categoryToIcon[category.id]
                          return Icon ? <Icon className="my-auto mr-1.5 w-4 h-4" /> : null
                        })()}
                        <p className="my-auto">{category.id}</p>
                      </div>
                      <div className="flex gap-px flex-wrap">
                        {category.id === 'custom' && (
                          <button
                            type="button"
                            className="rounded p-1 h-11 w-11 hover:bg-background-mod-subtle transition flex"
                            title="Add custom emoji by ID"
                            onClick={() => setInputtingCustom(true)}
                          >
                            <svg width={36} height={36} className="m-auto" viewBox="0 0 24 24">
                              <circle
                                cx="12"
                                cy="12"
                                r="10"
                                fill="transparent"
                                stroke="currentColor"
                                strokeWidth="1.5"
                              />
                              <path
                                fill="currentColor"
                                fillRule="evenodd"
                                d="M12 23a11 11 0 1 0 0-22 11 11 0 0 0 0 22zm0-17a1 1 0 0 1 1 1v4h4a1 1 0 1 1 0 2h-4v4a1 1 0 1 1-2 0v-4H7a1 1 0 1 1 0-2h4V7a1 1 0 0 1 1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        )}
                        {category.emojis.map((name) => {
                          const emoji = data.emojis[name]
                          const skin =
                            emoji.skins[
                              skinTone === undefined ? 0 : skinTone + 1
                            ] ?? emoji.skins[0]
                          const selected: SelectedEmoji = {
                            ...emoji,
                            skin,
                          }

                          return (
                            <GridEmoji
                              key={`emoji-category-${category.id}-emoji-${emoji.id}`}
                              emoji={selected}
                              onEmojiClick={onEmojiClick}
                              setHoverEmoji={setHoverEmoji}
                            />
                          )
                        })}
                      </div>
                    </div>
                  ))}
          </div>
          {hoverEmoji && (
            <div className="sticky bottom-0 left-0 w-full rounded-br-lg bg-base-lowest border-t border-border-subtle flex items-center gap-2 px-4 py-2">
              <Twemoji
                emoji={hoverEmoji.skin.native}
                className="h-7 shrink-0"
                title={hoverEmoji.id}
                loading="lazy"
              />
              <p className="text-base font-semibold truncate">
                :{hoverEmoji.id}:
              </p>
            </div>
          )}
        </div>
      </div>
        </>
      )}
    </div>
  )
}

export const EmojiPicker = memo(EmojiPicker_)

export const PopoutEmojiPicker: React.FC<{
  emoji?: APIMessageComponentEmoji
  setEmoji: (emoji: APIMessageComponentEmoji | undefined) => void
}> = ({ emoji, setEmoji }) => {
  const [open, setOpen] = useState(false)
  const id = `emoji-picker-${Math.random().toString(36).substring(7)}`

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex cursor-pointer h-9 w-9 rounded-[8px] bg-surface-high hover:bg-surface-higher transition border border-border-subtle"
        >
          <div className="m-auto">
            {emoji ? (
              emoji.id ? (
                <img
                  className="h-[22px] max-w-full"
                  src={`https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? 'gif' : 'webp'}`}
                  alt={emoji.name}
                />
              ) : (
                <Twemoji
                  emoji={emoji.name ?? ''}
                  className="h-[22px]"
                />
              )
            ) : (
              <Twemoji
                emoji="👏"
                className="h-[22px] opacity-20"
              />
            )}
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0 border-0 w-auto" sideOffset={8}>
        <EmojiPicker
          id={id}
          onEmojiClick={(selectedEmoji) => {
            const newEmoji: APIMessageComponentEmoji =
              selectedEmoji.keywords.includes('discord')
                ? {
                    id: selectedEmoji.skin.native,
                    name: selectedEmoji.name,
                    animated: selectedEmoji.keywords.includes('animated'),
                  }
                : {
                    name: selectedEmoji.skin.native,
                  }
            if (
              emoji &&
              emoji.id === newEmoji.id &&
              emoji.name === newEmoji.name
            ) {
              // Clear on double click
              setEmoji(undefined)
            } else {
              setEmoji(newEmoji)
            }
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
