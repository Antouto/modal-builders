// This file is a fork of @maddymeow's work on Discohook (AGPL 3.0) - thank you
// https://github.com/discohook/site

import React, { JSX, useEffect } from "react";

import { twJoin, twMerge } from "tailwind-merge";

import { cdn } from "@/util/discord";
import { highlightCode } from "@/util/highlighting";
import { getRelativeDateFormat } from "@/util/markdown/dates";
import {
  findEmoji,
  getEmojiName,
  translateNamedEmoji,
  trimToNearestNonSymbolEmoji,
} from "@/util/markdown/emoji";
import { getRgbComponents } from "@/util/text";
import { CoolIcon } from "../icons/CoolIcon";
import { Twemoji } from "../icons/Twemoji";
import {
  BrowseChannelIcon,
  ForumChannelIcon,
  GuideChannelIcon,
  PostChannelIcon,
  TextChannelIcon,
  ThreadChannelIcon,
  VoiceChannelIcon,
} from "../icons/channel";

type Renderable = string | JSX.Element;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ResolutionRequests = Record<string, keyof any>;

type BaseCapture = { size: number };

type MarkdownNode<
  Capture extends BaseCapture = BaseCapture,
  Data extends ResolutionRequests = ResolutionRequests,
> = {
  rule: Rule<Capture>;
  capture: Capture;
  data?: Data;
};

type Rule<
  Capture extends BaseCapture = BaseCapture,
  Data extends ResolutionRequests = ResolutionRequests,
> = {
  capture(source: string, state: State, parse: Parser): Capture | undefined;
  data?(capture: Capture): Data;
  render(
    capture: Capture,
    render: Renderer,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: { [Key in keyof Data]?: any[Data[keyof Data]] | null },
  ): Renderable;
};

type State = {
  completed: string;
  inQuote: boolean;
  listDepth: number;
  parseParagraphs: boolean;
};

type Parser = (source: string) => MarkdownNode[];
type Renderer = (nodes: MarkdownNode[]) => Renderable[];

type ParseResult = {
  nodes: MarkdownNode[];
  requests: Set<string>;
};

function createMarkdownParser(rules: Rule[]) {
  function parse(content: string, state: State): ParseResult {
    const nodes: MarkdownNode[] = [];
    const requests = new Set<string>();
    let source = content;

    while (source.length > 0) {
      for (const rule of rules) {
        const completed = state.completed;
        const capture = rule.capture(source, state, (content) => {
          const parsed = parse(content, state);
          for (const request of parsed.requests) {
            requests.add(request);
          }
          return parsed.nodes;
        });

        if (capture) {
          nodes.push({
            rule,
            capture,
            data: rule.data?.(capture),
          });

          state.completed = completed + source.slice(0, capture.size);
          source = source.slice(capture.size);
          break;
        }
      }
    }

    for (const node of nodes) {
      if (node.data) {
        for (const request of Object.values(node.data)) {
          requests.add(request as string);
        }
      }
    }

    return { nodes, requests };
  }

  return function parseMarkdown(content: string) {
    return parse(content, {
      completed: "",
      inQuote: false,
      listDepth: 0,
      parseParagraphs: false,
    });
  };
}

function renderMarkdownNodes(
  nodes: MarkdownNode[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any | undefined,
) {
  const elements: (JSX.Element | string)[] = [];

  for (const [index, node] of nodes.entries()) {
    const rendered = node.rule.render(
      node.capture,
      (nodes) => renderMarkdownNodes(nodes, data),
      data && node.data
        ? Object.fromEntries(
          Object.entries(node.data).map(([key, request]) => {
            return [key, data[request]];
          }),
        )
        : {},
    );

    let last = elements[elements.length - 1];
    if (typeof rendered === "string" && typeof last === "string") {
      last += rendered;
      elements[elements.length - 1] = last;
    } else {
      elements.push(
        typeof rendered === "string" 
          ? rendered 
          : React.cloneElement(rendered, { key: index })
      );
    }
  }

  return elements;
}

function defineRule<
  Capture extends BaseCapture,
  Data extends ResolutionRequests = ResolutionRequests,
>(rule: Rule<Capture, Data>) {
  return rule;
}

const headingRule = defineRule({
  capture(source, state, parse) {
    if (!/\n$|^$/.test(state.completed)) return;
    const match = /^ *(#{1,3})\s+((?!#+)[^\n]+?)#*\s*(?:\n|$)/.exec(source);
    if (!match) return;
    return {
      size: match[0].length,
      content: parse(match[2].trim()),
      level: match[1].length,
    };
  },
  render(capture, render) {
    const common =
      "mx-0 mb-[8px] mt-[16px] font-display font-bold leading-[1.375em] text-primary-130";

    if (capture.level === 1) {
      return (
        <h4
          className={twJoin(
            common,
            "text-[calc(var(--font-size)*1.5)] first:mt-[8px]",
          )}
        >
          {render(capture.content)}
        </h4>
      );
    }
    if (capture.level === 2) {
      return (
        <h5
          className={twJoin(
            common,
            "text-[calc(var(--font-size)*1.25)] first:mt-[8px]",
          )}
        >
          {render(capture.content)}
        </h5>
      );
    }
    return (
      <h6 className={twJoin(common, "text-[length:--font-size]")}>
        {render(capture.content)}
      </h6>
    );
  },
});

const footingRule = defineRule({
  capture(source, state, parse) {
    if (!/\n$|^$/.test(state.completed)) return;
    const match = /^-# +((?!(-#)+)[^\n]+?) *(?:\n|$)/.exec(source);
    if (!match) return;
    return {
      size: match[0].length,
      content: parse(match[1].trim()),
    };
  },
  render(capture, render) {
    return (
      <span className="block text-[calc(var(--font-size)*0.8125)] text-muted-dark">
        {render(capture.content)}
      </span>
    );
  },
});

export const codeBlockStyle =
  "block overflow-x-auto whitespace-pre-wrap rounded border border-primary-200 bg-primary-130 p-[0.5em] indent-0 font-code text-[calc(var(--font-size)*0.875)] leading-[calc(var(--font-size)*1.125)] border-primary-700 bg-primary-630 text-primary-230 [[data-embed]_&]:border-none [[data-embed]_&]:bg-primary-700";

const codeBlockRule = defineRule({
  capture(source) {
    // biome-ignore lint/correctness/noEmptyCharacterClassInRegex: Match anything, incl newline
    const match = /^```(?:([\w+.-]+?)\n)?\n*([^\n][^]*?)\n*```/i.exec(source);
    if (!match) return;
    return {
      size: match[0].length,
      content: match[2],
      language: match[1],
    };
  },
  render(capture) {
    const html = highlightCode(capture.content, capture.language);
    return (
      <pre className="mt-[6px] max-w-[90%] bg-clip-border">
        {html ? (
          <code
            className={codeBlockStyle}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: highlightCode generates HTML w/ highlight.js
            dangerouslySetInnerHTML={{ __html: html.value }}
          />
        ) : (
          <code className={codeBlockStyle}>{capture.content}</code>
        )}
      </pre>
    );
  },
});

const blockQuoteRule = defineRule({
  capture(source, state, parse) {
    if (state.inQuote) return;
    if (!/^$|\n *$/.test(state.completed)) return;
    const match =
      /^(?: *>>> +(.*))|^(?: *>(?!>>) +[^\n]*(?:\n *>(?!>>) +[^\n]*)*\n?)/su.exec(
        source,
      );
    if (!match) return;

    state.inQuote = true;
    const content = parse(match[1] ?? match[0].replaceAll(/^ *> ?/gm, ""));
    state.inQuote = false;

    return {
      size: match[0].length,
      content,
    };
  },
  render(capture, render) {
    return (
      <div className="flex">
        <div className="w-1 rounded bg-primary-500" />
        <blockquote className="max-w-[90%] pl-3 pr-2 indent-0">
          {render(capture.content)}
        </blockquote>
      </div>
    );
  },
});

const listRule = defineRule({
  capture(source, state, parse) {
    if (state.listDepth > 10) return;
    if (!/^$|\n *$/.test(state.completed)) return;
    const match =
      /^( *)([*-]|\d+\.) .+?(?:\n(?! )(?!\1(?:[*-]|\d+\.) )|$)/su.exec(source);
    if (!match) return;

    const bullet = match[2];
    const ordered = bullet.length > 1;
    const start = Math.min(1000000000, Math.max(1, Number(bullet)));
    let lastWasParagraph = false;
    const completed = state.completed;
    const content =
      match[0]
        .replace(/\n{2,}$/, "\n")
        .match(
          /( *)(?:[*-]|\d+\.) +[^\n]*(?:\n(?!\1(?:[*-]|\d+\.) )[^\n]*)*(?:\n|$)/gm,
        )
        ?.map((item, index, items) => {
          const spaces = /^ *(?:[*-]|\d+\.) +/.exec(item)?.[0].length || 1;
          const content = item
            .replaceAll(new RegExp(`^ {1,${spaces}}`, "gm"), "")
            .replace(/^ *(?:[*-]|\d+\.) +/, "");
          const isParagraph =
            content.includes("\n\n") ||
            (index === items.length - 1 && lastWasParagraph);
          lastWasParagraph = isParagraph;

          const currentDepth = state.listDepth;
          state.listDepth += 1;
          state.parseParagraphs = isParagraph;
          state.completed = completed;
          const parsed = parse(
            content.replace(/ *\n+$/, isParagraph ? "\n\n" : ""),
          );
          state.listDepth = currentDepth;
          state.parseParagraphs = false;

          return parsed;
        }) ?? [];

    return {
      size: match[0].length,
      ordered,
      start,
      content,
      depth: state.listDepth + 1,
    };
  },
  render(capture, render) {
    const items = capture.content.map((item) => (
      <li key={Math.random()} className="mb-[4px] whitespace-break-spaces">{render(item)}</li>
    ));

    if (capture.ordered) {
      const max = capture.start + capture.content.length - 1;
      return (
        <ol
          className="ml-[calc(0.4em+var(--max-digits)*0.6em)] mt-[4px] list-outside list-decimal"
          style={{
            // @ts-expect-error Tailwind var
            "--max-digits": String(max).length,
          }}
          start={capture.start}
        >
          {items}
        </ol>
      );
    }
    return (
      <ul
        className={twJoin(
          "ml-[16px] mt-[4px] list-outside",
          capture.depth > 1 ? "list-[circle]" : "list-disc",
        )}
      >
        {items}
      </ul>
    );
  },
});

const paragraphRule = defineRule({
  capture(source, state, parse) {
    if (!state.parseParagraphs) return;
    const match = /^((?:[^\n]|\n(?! *\n))+)(?:\n *)+\n/.exec(source);
    if (!match) return;

    state.parseParagraphs = false;
    const content = parse(match[1]);
    state.parseParagraphs = true;

    return {
      size: match[0].length,
      content,
    };
  },
  render(capture, render) {
    return <p>{render(capture.content)}</p>;
  },
});

const escapeRule = defineRule({
  capture(source) {
    const match = /^\\([^\d\sA-Za-z])/.exec(source);
    if (!match) return;
    return {
      size: match[0].length,
      content: match[1],
    };
  },
  render(capture) {
    return capture.content;
  },
});

export const mentionStyle =
  "rounded-[3px] px-[2px] font-semibold [unicode-bidi:plaintext] bg-[#5865f23d] text-[#a9baff] transition-colors transition-[50ms]";
const actionableMentionStyle = twMerge(
  mentionStyle,
  "cursor-pointer hover:bg-[#5865F2] hover:text-white",
);
const coloredMentionStyle = twMerge(
  mentionStyle,
  "bg-[rgb(var(--color)/0.1)] text-[rgb(var(--color))] hover:bg-[rgb(var(--color)/0.3)]",
);

const referenceRule = defineRule({
  capture(source) {
    const match =
      /^https:\/\/(?:canary\.|ptb\.)?discord.com\/channels\/(\d+|@me)\/(\d+)(?:\/threads\/(\d+))?(?:\/(\d+))?/.exec(
        source,
      );
    if (!match) return;
    return {
      size: match[0].length,
      guild: match[1],
      parent: match[3] ? match[2] : undefined,
      channel: match[3] ?? match[2],
      message: match[4],
    };
  },
  data(capture) {
    // TODO ignore when `guild` is @me
    return {
      // We could also resolve guild here, but that's only necessary
      // for cross-guild message references
      channel: `channel:${capture.channel}`,
    };
  },
  render(_, __, data) {
    return (
      <span className={actionableMentionStyle}>
        {
          // Links to messages in forum posts are slightly different (they include
          // the parent title) but that exact functionality is unfeasible here
          data.channel?.type === "post" ? (
            <>
              {channelIcons.forum()}
              forum
              <CoolIcon
                icon="Chevron_Right"
                className="text-[calc(var(--font-size)*0.6)] mx-0.5"
              />
              {channelIcons.post()}
              {data.channel.name ?? (
                <span className="italic">
                  Unkown
                </span>
              )}
            </>
          ) : data.channel ? (
            <>
              {channelIcons[data.channel.type]()}
              {data.channel.name ?? (
                <span className="italic">
                  Unknown
                </span>
              )}
              {/*
                Why is the chevron so tiny in the Discord client? My reproduction
                is too big, I felt weird making it smaller
              */}
              <CoolIcon
                icon="Chevron_Right"
                className="text-[calc(var(--font-size)*0.6)] mx-0.5"
              />
              {channelIcons.post()}
            </>
          ) : (
            <>
              {channelIcons.text()}
              <span className="italic">
                Unkown
              </span>
            </>
          )
        }
      </span>
    );
  },
});

export const linkClassName = twMerge(
  "[word-break:break-word] hover:underline text-blue-345",
);

/**
 * Transforms URLs like `discohook://path` to `/path`, which the client
 * will resolve appropriately
 */
const pathize = (href: string) => href.replace(/^discohook:\/\//, "/");

const resolvePathable = (href: string) => {
  const path = pathize(href);
  if (path !== href) {
    let origin: string;
    try {
      origin = window.location.origin;
    } catch {
      origin = "https://discohook.app";
    }
    return new URL(path, origin).href;
  }
  return href;
};

const linkRule = defineRule({
  capture(source) {
    const match = /^<([^ :>]+:\/[^ >]+)>/.exec(source);
    if (!match) return;
    try {
      new URL(match[1]);
    } catch {
      return;
    }
    return {
      size: match[0].length,
      url: new URL(match[1]).href,
    };
  },
  render(capture) {
    return (
      <a
        href={pathize(capture.url)}
        className={linkClassName}
        rel="noreferrer noopener nofollow ugc"
        target="_blank"
      >
        {resolvePathable(capture.url)}
      </a>
    );
  },
});

const autoLinkRule = defineRule({
  capture(source) {
    const match = /^(?:discohook|https?):\/\/[^\s<]+[^\s"',.:;<\]]/.exec(
      source,
    );
    if (!match) return;

    let url = match[0];
    let searchLeft = 0;
    let searchRight = url.length - 1;

    while (url[searchRight] === ")") {
      const index = url.indexOf("(", searchLeft);
      if (index === -1) {
        url = url.slice(0, -1);
        break;
      }
      searchLeft = index + 1;
      searchRight -= 1;
    }

    try {
      new URL(url);
    } catch {
      return;
    }
    return { size: url.length, url };
  },
  render(capture) {
    return (
      <a
        href={pathize(capture.url)}
        className={linkClassName}
        rel="noreferrer noopener nofollow ugc"
        target="_blank"
      >
        {resolvePathable(capture.url)}
      </a>
    );
  },
});

const INVITE_RESOLVABLE_RE =
  /^(https:\/\/)?((?:www\.)?(discord(?:app)?\.com\/invite)|(discord\.gg))\/(?<invite>.+)/;

const maskedLinkRule = defineRule({
  capture(source, _, parse) {
    const match =
      /^\[((?:\[[^\]]*\]|[^[\]]|\](?=[^[]*\]))*)\]\(\s*<?((?:\([^)]*\)|[^\s\\]|\\.)*?)>?(?:\s+['"](.*?)['"])?\s*\)/su.exec(
        source,
      );
    if (!match) return;

    const invalid = {
      valid: false,
      size: match[0].length,
      // We don't want to render any markdown inside of invalid masked links
      raw: match[0],
      content: parse(match[1]),
      url: match[2],
      title: match[3],
    };

    // empty space cannot be mask text
    if (match[1].trim().length === 0) {
      return invalid;
    }

    // URLs cannot be mask text
    try {
      new URL(match[1]);
      return invalid;
    } catch { }

    let url: URL;
    try {
      url = new URL(match[2]);
    } catch {
      return;
    }

    // invite links cannot be mask test
    if (INVITE_RESOLVABLE_RE.test(match[1])) {
      return invalid;
    }

    return {
      valid: true,
      size: match[0].length,
      raw: match[0],
      content: parse(match[1]),
      url: url.href,
      title: match[3],
    };
  },
  render(capture, render) {
    return capture.valid ? (
      <a
        href={pathize(capture.url)}
        title={capture.title}
        className={linkClassName}
        rel="noreferrer noopener nofollow ugc"
        target="_blank"
      >
        {render(capture.content)}
      </a>
    ) : (
      <span>{capture.raw}</span>
    );
  },
});

// For blog-type posts; not actually used in Discord previews
const maskedImageLinkRule = defineRule({
  // Exact same as maskedLinkRule pattern except with a prefixing `!`
  // Considering the complexity of this regex it would be desirable to reduce this
  capture(source) {
    const match =
      /^!\[((?:\[[^\]]*\]|[^[\]]|\](?=[^[]*\]))*)\]\(\s*<?((?:\([^)]*\)|[^\s\\]|\\.)*?)>?(?:\s+['"](.*?)['"])?\s*\)/su.exec(
        source,
      );
    if (!match) return;
    try {
      new URL(match[2]);
    } catch {
      return;
    }

    const dotDelimited = new URL(match[2]).pathname.split(".");
    return {
      size: match[0].length,
      content: match[1],
      url: new URL(match[2]).href,
      extension:
        dotDelimited.length === 0
          ? null
          : dotDelimited[dotDelimited.length - 1].toLowerCase(),
      title: match[3],
    };
  },
  render(capture) {
    return capture.extension !== null && ["mp4"].includes(capture.extension) ? (
      // biome-ignore lint/a11y/useMediaCaption: Not available
      <video
        title={capture.title}
        className="rounded-lg"
        rel="noreferrer noopener nofollow ugc"
        controls
      >
        <source src={pathize(capture.url)} type="video/mp4" />
      </video>
    ) : (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={pathize(capture.url)}
        title={capture.title}
        className="rounded-lg"
        rel="noreferrer noopener nofollow ugc"
        alt={capture.content || capture.title}
      />
    );
  },
});

const emphasisRule = defineRule({
  capture(source, _, parse) {
    const match =
      /^\b_((?:__|\\.|[^\\_])+?)_\b|^\*(?=\S)((?:\*\*|\\.|\s+(?:\\.|[^\s*\\]|\*\*)|[^\s*\\])+?)\*(?!\*)/su.exec(
        source,
      );
    if (!match) return;
    return {
      size: match[0].length,
      content: parse(match[2] || match[1]),
    };
  },
  render(capture, render) {
    return <em>{render(capture.content)}</em>;
  },
});

const strongRule = defineRule({
  capture(source, _, parse) {
    const match = /^\*\*((?:\\.|[^\\])+?)\*\*(?!\*)/su.exec(source);
    if (!match) return;
    return {
      size: match[0].length,
      content: parse(match[1]),
    };
  },
  render(capture, render) {
    return <strong className="font-semibold">{render(capture.content)}</strong>;
  },
});

const underlineRule = defineRule({
  capture(source, _, parse) {
    const match = /^__((?:\\.|[^\\])+?)__(?!_)/su.exec(source);
    if (!match) return;
    return {
      size: match[0].length,
      content: parse(match[1]),
    };
  },
  render(capture, render) {
    return <u>{render(capture.content)}</u>;
  },
});

const strikethroughRule = defineRule({
  capture(source, _, parse) {
    const match = /^~~(.+?)~~(?!_)/su.exec(source);
    if (!match) return;
    return {
      size: match[0].length,
      content: parse(match[1]),
    };
  },
  render(capture, render) {
    return <s>{render(capture.content)}</s>;
  },
});

export const codeStyle =
  "my-[-0.2em] size-auto whitespace-pre-wrap rounded-[3px] p-[0.2em] indent-0 font-code text-[length:0.85em] leading-[calc(var(--font-size)*1.125)] bg-[#5865f214] border border-border-normal";

const codeRule = defineRule({
  capture(source) {
    const match = /^(`+)(.*?[^`])\1(?!`)/su.exec(source);
    if (!match) return;
    return {
      size: match[0].length,
      content: match[2],
    };
  },
  render(capture) {
    return <code className={codeStyle}>{capture.content}</code>;
  },
});

const breakRule = defineRule({
  capture(source) {
    const match = /^ {2,}\n/.exec(source);
    if (!match) return;
    return {
      size: match[0].length,
    };
  },
  render() {
    return <br />;
  },
});

const spoilerRule = defineRule({
  capture(source, _, parse) {
    const match = /^\|\|(.+?)\|\|/su.exec(source);
    if (!match) return;
    return {
      size: match[0].length,
      content: parse(match[1]),
    };
  },
  render(capture, render) {
    return (
      <span className="rounded-[4px] box-decoration-clone bg-white/10">
        {render(capture.content)}
      </span>
    );
  },
});

function formatDateFull(date: Date) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthName = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  return `${monthName} ${day}, ${year} ${hours}:${minutes} ${ampm}`;
}

function formatDateShort(date: Date) {
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12; // Convert '0' hours to '12'

  return `${hours}:${minutes} ${ampm}`;
}

function formatDateLong(date: Date) {
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12; // Convert '0' hours to '12'

  return `${hours}:${minutes}:${seconds} ${ampm}`;
}

function formatDateDate(date: Date) {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

function formatDateVerbose(date: Date) {
  const day = date.getDate();
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${monthName} ${year}`;
}

function formatDateFullVerbose(date: Date) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayName = days[date.getDay()];
  const monthName = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  return `${dayName}, ${monthName} ${day}, ${year} ${hours}:${minutes} ${ampm}`;
}

function formatDateRelative(relativeFormat: string, n: number) {
  const timeFormats = {
    "seconds_future": "in {{count}} seconds",
    "seconds_past": "{{count}} seconds ago",
    "minutes_future_one": "in a minute",
    "minutes_future_other": "in {{count}} minutes",
    "minutes_past_one": "a minute ago",
    "minutes_past_other": "{{count}} minutes ago",
    "hours_future_one": "in an hour",
    "hours_future_other": "in {{count}} hours",
    "hours_past_one": "an hour ago",
    "hours_past_other": "{{count}} hours ago",
    "days_future_one": "in a day",
    "days_future_other": "in {{count}} days",
    "days_past_one": "a day ago",
    "days_past_other": "{{count}} days ago",
    "months_future_one": "in a month",
    "months_future_other": "in {{count}} months",
    "months_past_one": "a month ago",
    "months_past_other": "{{count}} months ago",
    "years_future_one": "in a year",
    "years_future_other": "in {{count}} years",
    "years_past_one": "a year ago",
    "years_past_other": "{{count}} years ago"
  };

  // Determine if singular or plural form should be used
  const suffix = n === 1 ? '_one' : '_other';
  const formatKey = relativeFormat.includes('minutes') || relativeFormat.includes('hours') ||
    relativeFormat.includes('days') || relativeFormat.includes('months') ||
    relativeFormat.includes('years')
    ? `${relativeFormat}${suffix}`
    : relativeFormat;

  //@ts-expect-error stupid eslint                  
  const formatString = timeFormats[formatKey];
  return formatString.replace('{{count}}', n);
}

export const timestampFormats = {
  t: "time",
  T: "time_verbose",
  f: "full",
  F: "full_verbose",
  d: "date",
  D: "date_verbose",
  R: "relative",
} as const;
const timestampRule = defineRule({
  capture(source) {
    const match = /^<t:(-?\d+)(?::([DFRTdft]))?>/.exec(source);
    if (!match) return;
    const date = new Date(Number(match[1]) * 1000);
    if (Number.isNaN(date.getTime())) return;
    return {
      size: match[0].length,
      date,
      format:
        timestampFormats[(match[2] as keyof typeof timestampFormats) ?? "f"],
    };
  },
  render(capture) {
    const [relativeFormat, n] = getRelativeDateFormat(capture.date);

    return (
      <span
        className="rounded-[3px] px-[2px] bg-primary-500/[0.48]"
        title={capture.date.toLocaleString()}
      >
        {(() => {
          if (capture.format === 'full') return formatDateFull(capture.date)
          if (capture.format === 'full_verbose') return formatDateFullVerbose(capture.date)
          if (capture.format === 'relative') return formatDateRelative(relativeFormat, n)
          if (capture.format === 'time') return formatDateShort(capture.date)
          if (capture.format === 'time_verbose') return formatDateLong(capture.date)
          if (capture.format === 'date') return formatDateDate(capture.date)
          if (capture.format === 'date_verbose') return formatDateVerbose(capture.date)
        })()}
      </span>
    );
  },
});

const channelIconStyle =
  "mb-[calc(var(--font-size)*0.2)] inline size-[--font-size] align-text-bottom mr-1";
export const channelIcons: Record<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any | "guide" | "browse",
  (props?: { className?: string }) => JSX.Element
> = {
  guide: (props?: { className?: string }) => (
    <GuideChannelIcon className={twMerge(channelIconStyle, props?.className)} />
  ),
  browse: (props?: { className?: string }) => (
    <BrowseChannelIcon
      className={twMerge(channelIconStyle, props?.className)}
    />
  ),
  text: (props?: { className?: string }) => (
    <TextChannelIcon className={twMerge(channelIconStyle, props?.className)} />
  ),
  voice: (props?: { className?: string }) => (
    <VoiceChannelIcon className={twMerge(channelIconStyle, props?.className)} />
  ),
  thread: (props?: { className?: string }) => (
    <ThreadChannelIcon
      className={twMerge(channelIconStyle, props?.className)}
    />
  ),
  forum: (props?: { className?: string }) => (
    <ForumChannelIcon className={twMerge(channelIconStyle, props?.className)} />
  ),
  post: (props?: { className?: string }) => (
    <PostChannelIcon className={twMerge(channelIconStyle, props?.className)} />
  ),
} as const;

const globalMentionRule = defineRule({
  capture(source) {
    const match = /^@everyone|^@here/.exec(source);
    if (!match) return;
    return {
      size: match[0].length,
      content: match[0],
    };
  },
  render(capture) {
    return <span className={mentionStyle}>{capture.content}</span>;
  },
});

const guildSectionMentionRule = defineRule({
  capture(source) {
    const match = /^<id:(guide|browse|customize)>/.exec(source);
    if (!match) return;
    return {
      size: match[0].length,
      id: match[1],
    };
  },
  render(capture) {
    const type =
      capture.id === "customize"
        ? "browse"
        : (capture.id as "guide" | "browse");

    return (
      <span className={actionableMentionStyle}>
        {channelIcons[type]()}
        {capture.id === "guide" ? "Server Guide" : ""}
        {capture.id === "browse" ? "Browse Channels" : ""}
        {capture.id === "customize" ? "Channels & Roles" : ""}
      </span>
    );
  },
});

//not from discohook
//@ts-expect-error stupid eslint
export function ChannelMention({ guild_id, channel }: { guild_id: string }) {
  return (<a href={`https://discord.com/channels/${guild_id}/${channel.id}`} target="_blank" className={actionableMentionStyle}>
    {channelIcons[channel.type === 15 ? 'forum' : 'text']({
      className: 'size-4 mb-[3.2px] mr-[4px]'
    })}
    {channel.name}
  </a>)
}

const channelMentionRule = defineRule({
  capture(source) {
    const match = /^<#(\d+)>/.exec(source);
    if (!match) return;
    return {
      size: match[0].length,
      id: match[1],
    };
  },
  data(capture) {
    return {
      channel: `channel:${capture.id}`,
    };
  },
  render(_capture, _, data) {
    if (data.channel === undefined) {
      <span className={actionableMentionStyle}>
        {channelIcons.text()}channel
      </span>;
    }

    return (
      <span className={actionableMentionStyle}>
        {channelIcons[data.channel?.type ?? "text"]()}
        {data.channel?.name ?? (
          <span className="italic">
            Unkown Mention
          </span>
        )}
      </span>
    );
  },
});

const memberMentionRule = defineRule({
  capture(source) {
    const match = /^<@!?(\d+)>/.exec(source);
    if (!match) return;
    return {
      size: match[0].length,
      id: match[1],
    };
  },
  data(capture) {
    return {
      member: `member:@global-${capture.id}`,
    };
  },
  render(capture, _, data) {
    if (data.member === undefined) {
      <span className={actionableMentionStyle}>@member</span>;
    }

    return (
      <span className={actionableMentionStyle}>
        {data.member ? (
          `@${data.member.nick ??
          data.member.user.global_name ??
          data.member.user.username
          }`
        ) : (
          <span>
            @Unkown User
          </span>
        )}
      </span>
    );
  },
});

const roleMentionRule = defineRule({
  capture(source) {
    const match = /^<@&(\d+)>/.exec(source);
    if (!match) return;
    return {
      size: match[0].length,
      id: match[1],
    };
  },
  data(capture) {
    return {
      role: `role:${capture.id}`,
    };
  },
  render(capture, _, data) {
    if (data.role === undefined) {
      return <span className={mentionStyle}>@role</span>;
    } else if (!data.role) {
      return (
        <span>
          @Deleted Role
        </span>
      );
    }

    const [red, green, blue] = getRgbComponents(data.role.color);

    return (
      <span
        className={data.role.color ? coloredMentionStyle : mentionStyle}
        // @ts-expect-error Tailwind var
        style={{ "--color": `${red} ${green} ${blue}` }}
      >
        @{data.role.name}
      </span>
    );
  },
});

const commandMentionRule = defineRule({
  capture(source) {
    const match =
      /^<\/((?:[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32})(?: [-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}){0,2}):(\d+)>/u.exec(
        source,
      );
    if (!match) return;
    return {
      size: match[0].length,
      name: match[1],
      id: match[2],
    };
  },
  render(capture) {
    return <span className={actionableMentionStyle}>/{capture.name}</span>;
  },
});

const emojiStyle =
  "inline size-[1.375em] object-contain [[data-large-emoji]_&]:size-[calc(var(--font-size)*3)]";

const customEmojiRule = defineRule({
  capture(source) {
    const match = /^<(a)?:(\w+):(\d+)>/.exec(source);
    if (!match) return;
    return {
      size: match[0].length,
      name: match[2],
      id: match[3],
      animated: Boolean(match[1]),
    };
  },
  render(capture) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={cdn.emoji(capture.id, capture.animated ? "gif" : "webp")}
        alt={capture.name}
        title={capture.name}
        className={emojiStyle}
      />
    );
  },
});

const unicodeEmojiRule = defineRule({
  capture(source) {
    const { content, offset, name } = translateNamedEmoji(source);
    const emoji = findEmoji(content);
    if (!emoji) return;
    return {
      size: offset + emoji.length,
      emoji,
      name: `:${name ?? getEmojiName(emoji)}:`,
    };
  },
  render(capture) {
    return <Twemoji emoji={capture.emoji} className={emojiStyle} />;
  },
});

const textRule = defineRule({
  capture(source) {
    const match = /^(?:[\p{L}\p{M}\p{N}\p{Z}]+|¯\\_\(ツ\)_\/¯)/su.exec(source);
    if (!match) {
      return {
        size: 1,
        content: source[0],
      };
    }

    const content = trimToNearestNonSymbolEmoji(match[0]);
    return {
      size: content.length,
      content,
    };
  },
  render(capture) {
    return capture.content;
  },
});

type RuleOptionKey =
  | "headings"
  | "footings"
  | "codeBlocks"
  | "inlineCode"
  | "blockQuotes"
  | "lists"
  | "paragraphs"
  | "escapes"
  | "references"
  | "links"
  | "autoLinks"
  | "maskedImageLinks"
  | "maskedLinks"
  | "italic"
  | "bold"
  | "underline"
  | "strikethrough"
  | "breaks"
  | "spoilers"
  | "timestamps"
  | "globalMentions"
  | "guildSectionMentions"
  | "channelMentions"
  | "memberMentions"
  | "roleMentions"
  | "commandMentions"
  | "customEmojis"
  | "unicodeEmojis"
  | "text";

export const ruleOptions: Record<
  RuleOptionKey,
  { rule: Rule; title?: boolean; full?: boolean }
> = {
  headings: { rule: headingRule, full: true },
  footings: { rule: footingRule, full: true },
  codeBlocks: { rule: codeBlockRule, full: true },
  inlineCode: { rule: codeRule, title: true, full: true },
  blockQuotes: { rule: blockQuoteRule, full: true },
  lists: { rule: listRule, full: true },
  paragraphs: { rule: paragraphRule, title: true, full: true },
  escapes: { rule: escapeRule, title: true, full: true },
  references: { rule: referenceRule, full: true },
  links: { rule: linkRule, title: true, full: true },
  autoLinks: { rule: autoLinkRule, title: true, full: true },
  maskedImageLinks: { rule: maskedImageLinkRule },
  maskedLinks: { rule: maskedLinkRule, full: true },
  italic: { rule: emphasisRule, title: true, full: true },
  bold: { rule: strongRule, title: true, full: true },
  underline: { rule: underlineRule, title: true, full: true },
  strikethrough: { rule: strikethroughRule, title: true, full: true },
  breaks: { rule: breakRule, title: true, full: true },
  spoilers: { rule: spoilerRule, title: true, full: true },
  timestamps: { rule: timestampRule, title: true, full: true },
  globalMentions: { rule: globalMentionRule, full: true },
  guildSectionMentions: {
    rule: guildSectionMentionRule,
    title: true,
    full: true,
  },
  channelMentions: { rule: channelMentionRule, title: true, full: true },
  memberMentions: { rule: memberMentionRule, full: true },
  roleMentions: { rule: roleMentionRule, full: true },
  commandMentions: { rule: commandMentionRule, full: true },
  customEmojis: { rule: customEmojiRule, title: true, full: true },
  unicodeEmojis: { rule: unicodeEmojiRule, title: true, full: true },
  text: { rule: textRule, title: true, full: true },
};

export type MarkdownFeatures = "title" | "full";

export type FeatureConfig =
  | MarkdownFeatures
  | (Partial<Record<RuleOptionKey, boolean>> & { extend?: MarkdownFeatures });

const extendable: Record<MarkdownFeatures, RuleOptionKey[]> = {
  full: Object.entries(ruleOptions)
    .filter((pair) => pair[1].full)
    .map((pair) => pair[0] as RuleOptionKey),
  title: Object.entries(ruleOptions)
    .filter((pair) => pair[1].title)
    .map((pair) => pair[0] as RuleOptionKey),
};

const getRules = (features: FeatureConfig) => {
  let rules: Rule[];
  if (typeof features === "string") {
    rules = extendable[features].map((key) => ruleOptions[key].rule);
  } else {
    const { extend, ...ft } = features;
    const enabledKeys = extend
      ? [
        ...extendable[extend].filter((key) => ft[key] !== false),
        ...Object.keys(ruleOptions).filter(
          (key) => ft[key as RuleOptionKey] === true,
        ),
      ]
      : Object.entries(ft)
        .filter((pair) => pair[1])
        .map((pair) => pair[0]);

    rules = Object.entries(ruleOptions)
      .filter((pair) => enabledKeys.includes(pair[0]))
      .map((pair) => pair[1].rule);
  }

  return rules;
};

export const getEnabledRuleKeys = (
  features: FeatureConfig,
): RuleOptionKey[] => {
  let keys: RuleOptionKey[];
  if (typeof features === "string") {
    keys = extendable[features];
  } else {
    const { extend, ...ft } = features;
    keys = extend
      ? [
        ...extendable[extend].filter((key) => ft[key] !== false),
        ...Object.keys(ruleOptions).filter(
          (key): key is RuleOptionKey => ft[key as RuleOptionKey] === true,
        ),
      ]
      : Object.entries(ft)
        .filter((pair) => pair[1])
        .map((pair) => pair[0] as RuleOptionKey);
  }

  return keys;
};

/**
 * Emulate what Discord silently does to strings before saving the data
 */
const trimContent = (text: string) => {
  return text.trim();
};

export const Markdown: React.FC<{
  content: string;
  features?: FeatureConfig;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cache?: any;
}> = ({ content, features, cache }) => {
  const parse = createMarkdownParser(getRules(features ?? "full"));
  const result = parse(trimContent(content));

  const resolver = {
    resolved: cache?.state,
  };

  useEffect(() => {
    if (result.requests.size > 0 && cache) {
      cache.resolveMany(result.requests);
    }
  }, [result, cache]);

  return <div>{renderMarkdownNodes(result.nodes, resolver.resolved)}</div>;
};