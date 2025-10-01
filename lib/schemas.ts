import { ChannelType, ComponentType, TextInputStyle } from "discord-api-types/v10";
import z from "zod"

const textInputSchema = z
  .object({
    type: z.literal(ComponentType.TextInput),
    custom_id: z.string().min(1).max(100),
    style: z.union([z.literal(TextInputStyle.Short), z.literal(TextInputStyle.Paragraph)]),
    placeholder: z.string().trim().min(1).max(100).optional(),
    value: z.string().trim().min(1).optional(),
    min_length: z.number().int().min(0).max(4000).optional(),
    max_length: z.number().int().min(1).max(4000).optional(),
    required: z.boolean().optional()
  })
  .refine(
    (val) => {
      // Both are numbers, check min <= max
      if (typeof val.min_length === "number" && typeof val.max_length === "number") {
        return val.max_length >= val.min_length;
      }
      return true;
    },
    { path: ["max_length"], message: "Must be greater than or equal to min length" }
  )
  .refine(
    (val) => {
      // Both are numbers, check min <= max
      if (typeof val.min_length === "number" && typeof val.max_length === "number") {
        return val.min_length <= val.max_length;
      }
      return true;
    },
    { path: ["min_length"], message: "Must be less than or equal to max length" }
  )
  .refine(
    (val) => {
      // Skip validation if value is not provided
      if (!val.value) {
        return true;
      }

      // Get effective min_length (default to 0 if empty string or undefined)
      const minLength = (val.min_length === undefined) ? 0 : val.min_length;

      // Check minimum length
      if (typeof minLength === "number" && val.value.length < minLength) {
        return false;
      }

      return true;
    },
    { path: ["value"], message: "Value is too short" }
  )
  .refine(
    (val) => {
      // Skip validation if value is not provided
      if (!val.value) {
        return true;
      }

      // Get effective max_length (default to 4000 if empty string)
      const maxLength = val.max_length === undefined ? 4000 : val.max_length;

      // Check maximum length
      if (typeof maxLength === "number" && val.value.length > maxLength) {
        return false;
      }

      return true;
    },
    { path: ["value"], message: "Value is too long" }
  );

  export function getSumOfTextDisplaysInModal(components: Array<{ type: number; content?: string }>): number {
    let sum = 0;
    for (const comp of components) {
      if (comp.type === ComponentType.TextDisplay && typeof comp.content === 'string') {
        sum += comp.content.length;
      }
    }
    return sum;
  }

const emojiSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  animated: z.boolean().optional()
});

const selectOptionSchema = z.object({
  label: z.string().trim().min(1).max(100),
  value: z.string().trim().min(1).max(100),
  description: z.string().trim().max(100).optional(),
  emoji: emojiSchema.optional(),
  default: z.boolean().optional()
});

const stringSelectSchema = z.object({
  type: z.literal(ComponentType.StringSelect),
  custom_id: z.string().min(1).max(100),
  placeholder: z.string().trim().min(1).max(150).optional(),
  min_values: z.number().int().min(0).max(25).optional(),
  max_values: z.number().int().min(1).max(25).optional(),
  // disabled: z.boolean().optional(),
  options: z.array(selectOptionSchema).min(1).max(25),
  required: z.boolean().optional() // Whether this select menu is required or not, only used in modals
}).refine(
  (val) => {
    // Skip validation if min_values is undefined
    if (val.min_values === undefined) {
      return true;
    }
    // Get effective max_values (default to 1 if not set, as per Discord API)
    const effectiveMaxValues = val.max_values ?? 1;
    // Check min <= max
    if (typeof val.min_values === "number") {
      return val.min_values <= effectiveMaxValues;
    }
    return true;
  },
  { path: ["max_values"], message: "Must be greater than or equal to min values" }
).refine(
  (val) => {
    // Skip validation if min_values is undefined
    if (val.min_values === undefined) {
      return true;
    }
    // Get effective max_values (default to 1 if not set, as per Discord API)
    const effectiveMaxValues = val.max_values ?? 1;
    // Check min <= max
    if (typeof val.min_values === "number") {
      return val.min_values <= effectiveMaxValues;
    }
    return true;
  },
  { path: ["min_values"], message: "Must be less than or equal to max values" }
).refine(
  (val) => {
    // Skip validation if max_values is empty string or undefined
    if (val.max_values === undefined) {
      return true;
    }
    // Check if max_values is a number and compare with options length
    if (typeof val.max_values === "number") {
      return val.max_values <= val.options.length;
    }
    return true;
  },
  { path: ["max_values"], message: "Cannot be greater than the number of options" }
).refine(
  (val) => {
    // Skip validation if min_values is undefined
    if (val.min_values === undefined) {
      return true;
    }
    return val.min_values <= val.options.length;
  },
  { path: ["min_values"], message: "Cannot be greater than the number of options" }
).refine(
  (val) => {
    // Count the number of default options
    const defaultCount = val.options.filter(opt => opt.default === true).length;
    // Get effective max_values (default to 1 if not set)
    const effectiveMaxValues = val.max_values ?? 1;
    // Check if default count exceeds max_values
    return defaultCount <= effectiveMaxValues;
  },
  { path: ["options"], message: "Cannot have more default selections than max values" }
);

const selectDefaultValueSchema = z.object({
  id: z.string().regex(/^[0-9]{17,19}$/),
  type: z.union([z.literal("user"), z.literal("role"), z.literal("channel")])
});

const userSelectSchema = z.object({
  type: z.literal(ComponentType.UserSelect),
  custom_id: z.string().min(1).max(100),
  placeholder: z.string().trim().min(1).max(150).optional(),
  min_values: z.number().int().min(0).max(25).optional(),
  max_values: z.number().int().min(1).max(25).optional(),
  default_values: z.array(selectDefaultValueSchema).optional(),
  required: z.boolean().optional() // Whether this select menu is required or not, only used in modals
}).refine(
  (val) => {
    // Skip validation if min_values is undefined
    if (val.min_values === undefined) {
      return true;
    }
    // Get effective max_values (default to 1 if not set, as per Discord API)
    const effectiveMaxValues = val.max_values ?? 1;
    // Check min <= max
    if (typeof val.min_values === "number") {
      return val.min_values <= effectiveMaxValues;
    }
    return true;
  },
  { path: ["max_values"], message: "Must be greater than or equal to min values" }
).refine(
  (val) => {
    // Only validate if default_values is provided
    if (!val.default_values) {
      return true;
    }
    // If multiple default values are set, max_values must be provided as a number
    if (Array.isArray(val.default_values) && val.default_values.length > 1) {
      return typeof val.max_values === "number";
    }
    return true;
  },
  { path: ["max_values"], message: "Max values is required when multiple default values are set" }
).refine(
  (val) => {
    // Only validate if default_values is provided
    if (!val.default_values) {
      return true;
    }
    // Skip validation if max_values is empty string or undefined
    if (val.max_values === undefined) {
      return true;
    }
    // Check if max_values is a number and compare with default_values length
    if (typeof val.max_values === "number") {
      return val.default_values.length <= val.max_values;
    }
    return true;
  },
  { path: ["max_values"], message: "Cannot be less than the number of default values" }
).refine(
  (val) => {
    // Only validate if default_values is provided
    if (!val.default_values) {
      return true;
    }
    // Skip validation if min_values is empty string or undefined
    if (val.min_values === undefined) {
      return true;
    }
    // Check if min_values is a number and compare with default_values length
    if (val.default_values.length && typeof val.min_values === "number") {
      return val.default_values.length >= val.min_values;
    }
    return true;
  },
  { path: ["min_values"], message: "Cannot be greater than the number of default values" }
);

const channelSelectSchema = z.object({
  type: z.literal(ComponentType.ChannelSelect),
  custom_id: z.string().min(1).max(100),
  placeholder: z.string().trim().min(1).max(150).optional(),
  min_values: z.number().int().min(0).max(25).optional(),
  max_values: z.number().int().min(1).max(25).optional(),
  default_values: z.array(selectDefaultValueSchema).optional(),
  channel_types: z.array(z.union([z.literal(ChannelType.GuildText), z.literal(ChannelType.GuildVoice), z.literal(ChannelType.GuildCategory), z.literal(ChannelType.GuildAnnouncement), z.literal(ChannelType.AnnouncementThread), z.literal(ChannelType.PublicThread), z.literal(ChannelType.PrivateThread), z.literal(ChannelType.GuildStageVoice), z.literal(ChannelType.GuildDirectory), z.literal(ChannelType.GuildForum), z.literal(ChannelType.GuildMedia)])).optional(),
  required: z.boolean().optional() // Whether this select menu is required or not, only used in modals
}).refine(
  (val) => {
    // Skip validation if min_values is undefined
    if (val.min_values === undefined) {
      return true;
    }
    // Get effective max_values (default to 1 if not set, as per Discord API)
    const effectiveMaxValues = val.max_values ?? 1;
    // Check min <= max
    if (typeof val.min_values === "number") {
      return val.min_values <= effectiveMaxValues;
    }
    return true;
  },
  { path: ["max_values"], message: "Must be greater than or equal to min values" }
).refine(
  (val) => {
    // Only validate if default_values is provided
    if (!val.default_values) {
      return true;
    }
    // If multiple default values are set, max_values must be provided as a number
    if (Array.isArray(val.default_values) && val.default_values.length > 1) {
      return typeof val.max_values === "number";
    }
    return true;
  },
  { path: ["max_values"], message: "Max values is required when multiple default values are set" }
).refine(
  (val) => {
    // Only validate if default_values is provided
    if (!val.default_values) {
      return true;
    }
    // Skip validation if max_values is empty string or undefined
    if (val.max_values === undefined) {
      return true;
    }
    // Check if max_values is a number and compare with default_values length
    if (typeof val.max_values === "number") {
      return val.default_values.length <= val.max_values;
    }
    return true;
  },
  { path: ["max_values"], message: "Cannot be less than the number of default values" }
).refine(
  (val) => {
    // Only validate if default_values is provided
    if (!val.default_values) {
      return true;
    }
    // Skip validation if min_values is empty string or undefined
    if (val.min_values === undefined) {
      return true;
    }
    // Check if min_values is a number and compare with default_values length
    if (val.default_values.length && typeof val.min_values === "number") {
      return val.default_values.length >= val.min_values;
    }
    return true;
  },
  { path: ["min_values"], message: "Cannot be greater than the number of default values" }
);

const roleSelectSchema = z.object({
  type: z.literal(ComponentType.RoleSelect),
  custom_id: z.string().min(1).max(100),
  placeholder: z.string().trim().min(1).max(150).optional(),
  min_values: z.number().int().min(0).max(25).optional(),
  max_values: z.number().int().min(1).max(25).optional(),
  default_values: z.array(selectDefaultValueSchema).optional(),
  required: z.boolean().optional() // Whether this select menu is required or not, only used in modals
}).refine(
  (val) => {
    // Skip validation if min_values is undefined
    if (val.min_values === undefined) {
      return true;
    }
    // Get effective max_values (default to 1 if not set, as per Discord API)
    const effectiveMaxValues = val.max_values ?? 1;
    // Check min <= max
    if (typeof val.min_values === "number") {
      return val.min_values <= effectiveMaxValues;
    }
    return true;
  },
  { path: ["max_values"], message: "Must be greater than or equal to min values" }
).refine(
  (val) => {
    // Only validate if default_values is provided
    if (!val.default_values) {
      return true;
    }
    // If multiple default values are set, max_values must be provided as a number
    if (Array.isArray(val.default_values) && val.default_values.length > 1) {
      return typeof val.max_values === "number";
    }
    return true;
  },
  { path: ["max_values"], message: "Max values is required when multiple default values are set" }
).refine(
  (val) => {
    // Only validate if default_values is provided
    if (!val.default_values) {
      return true;
    }
    // Skip validation if max_values is empty string or undefined
    if (val.max_values === undefined) {
      return true;
    }
    // Check if max_values is a number and compare with default_values length
    if (typeof val.max_values === "number") {
      return val.default_values.length <= val.max_values;
    }
    return true;
  },
  { path: ["max_values"], message: "Cannot be less than the number of default values" }
).refine(
  (val) => {
    // Only validate if default_values is provided
    if (!val.default_values) {
      return true;
    }
    // Skip validation if min_values is empty string or undefined
    if (val.min_values === undefined) {
      return true;
    }
    // Check if min_values is a number and compare with default_values length
    if (val.default_values.length && typeof val.min_values === "number") {
      return val.default_values.length >= val.min_values;
    }
    return true;
  },
  { path: ["min_values"], message: "Cannot be greater than the number of default values" }
);

const mentionableSelectSchema = z.object({
  type: z.literal(ComponentType.MentionableSelect),
  custom_id: z.string().min(1).max(100),
  placeholder: z.string().trim().min(1).max(150).optional(),
  min_values: z.number().int().min(0).max(25).optional(),
  max_values: z.number().int().min(1).max(25).optional(),
  default_values: z.array(selectDefaultValueSchema).optional(),
  required: z.boolean().optional() // Whether this select menu is required or not, only used in modals
}).refine(
  (val) => {
    // Skip validation if min_values is undefined
    if (val.min_values === undefined) {
      return true;
    }
    // Get effective max_values (default to 1 if not set, as per Discord API)
    const effectiveMaxValues = val.max_values ?? 1;
    // Check min <= max
    if (typeof val.min_values === "number") {
      return val.min_values <= effectiveMaxValues;
    }
    return true;
  },
  { path: ["max_values"], message: "Must be greater than or equal to min values" }
).refine(
  (val) => {
    // Only validate if default_values is provided
    if (!val.default_values) {
      return true;
    }
    // If multiple default values are set, max_values must be provided as a number
    if (Array.isArray(val.default_values) && val.default_values.length > 1) {
      return typeof val.max_values === "number";
    }
    return true;
  },
  { path: ["max_values"], message: "Max values is required when multiple default values are set" }
).refine(
  (val) => {
    // Only validate if default_values is provided
    if (!val.default_values) {
      return true;
    }
    // Skip validation if max_values is empty string or undefined
    if (val.max_values === undefined) {
      return true;
    }
    // Check if max_values is a number and compare with default_values length
    if (typeof val.max_values === "number") {
      return val.default_values.length <= val.max_values;
    }
    return true;
  },
  { path: ["max_values"], message: "Cannot be less than the number of default values" }
).refine(
  (val) => {
    // Only validate if default_values is provided
    if (!val.default_values) {
      return true;
    }
    // Skip validation if min_values is empty string or undefined
    if (val.min_values === undefined) {
      return true;
    }
    // Check if min_values is a number and compare with default_values length
    if (val.default_values.length && typeof val.min_values === "number") {
      return val.default_values.length >= val.min_values;
    }
    return true;
  },
  { path: ["min_values"], message: "Cannot be greater than the number of default values" }
);

const fileUploadSchema = z.object({
  type: z.literal(19),
  custom_id: z.string().min(1).max(100),
  min_values: z.number().int().min(0).max(10).optional(),
  max_values: z.number().int().min(1).max(10).optional(),
  required: z.boolean().optional()
}).refine(
  (val) => {
    // Skip validation if min_values is undefined
    if (val.min_values === undefined) {
      return true;
    }
    // Get effective max_values (default to 1 if not set, as per Discord API)
    const effectiveMaxValues = val.max_values ?? 1;
    // Check min <= max
    if (typeof val.min_values === "number") {
      return val.min_values <= effectiveMaxValues;
    }
    return true;
  },
  { path: ["max_values"], message: "Must be greater than or equal to min values" }
).refine(
  (val) => {
    // Skip validation if min_values is undefined
    if (val.min_values === undefined) {
      return true;
    }
    // Get effective max_values (default to 1 if not set, as per Discord API)
    const effectiveMaxValues = val.max_values ?? 1;
    // Check min <= max
    if (typeof val.min_values === "number") {
      return val.min_values <= effectiveMaxValues;
    }
    return true;
  },
  { path: ["min_values"], message: "Must be less than or equal to max values" }
);

export const labelSchema = z.object({
  type: z.literal(ComponentType.Label),
  label: z.string().trim().min(1).max(45),
  description: z.string().trim().min(1).max(100).optional(),
  component: z.union([textInputSchema, stringSelectSchema, userSelectSchema, channelSelectSchema, roleSelectSchema, mentionableSelectSchema, fileUploadSchema])
})

export const textDisplaySchema = z.object({
  type: z.literal(ComponentType.TextDisplay),
  content: z.string().trim().min(1),
})

export const modalSchema = z.object({
  title: z.string().min(1).max(45),
  custom_id: z.string().min(1),
  components: z.array(z.discriminatedUnion("type", [labelSchema, textDisplaySchema])).min(1).max(5)
}).refine(
  (val) => {
    const totalTextDisplayLength = getSumOfTextDisplaysInModal(val.components);
    return totalTextDisplayLength <= 4000;
  },
  { path: ["components"], message: "Total text display content cannot exceed 4000 characters" }
)