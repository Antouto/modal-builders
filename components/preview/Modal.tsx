import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { modalSchema } from "@/lib/schemas";
import z from "zod";
import ReactSelect from "react-select";
import { Twemoji } from "@/components/icons/Twemoji";
import { cdn } from "@/util/discord";
import { Markdown } from "@/components/preview/Markdown";
import { ComponentType } from "discord-api-types/v10";
import { getChannelIcon } from "@/lib/utils";
import FormsLogo from "@/app/FormsLogo";

const handleTextAreaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  const textarea = e.target;
  // Reset height temporarily to get the correct scrollHeight
  textarea.style.height = 'auto';
  // Set the height to match content
  textarea.style.height = `${textarea.scrollHeight}px`;
};

const CustomOption = (props: {
  data: {
    label: string;
    value: string;
    description: string | undefined;
    emoji?: { id?: string; name?: string; animated?: boolean } | undefined;
  };
  innerRef: React.Ref<HTMLDivElement>;
  innerProps: React.HTMLProps<HTMLDivElement>;
}) => {
  const { data, innerRef, innerProps } = props;
  return (
    <div ref={innerRef} {...innerProps} style={{ padding: '8px', cursor: 'pointer' }}>
      <div className="flex items-center">
        {data.emoji?.id ? (
          <img
            src={cdn.emoji(data.emoji.id, data.emoji.animated ? "gif" : "webp")}
            className="w-[22px] h-[22px] mr-2 my-auto shrink-0"
            alt={data.emoji.name}
          />
        ) : data.emoji?.name ? (
          <Twemoji
            emoji={data.emoji.name}
            className="w-[22px] h-[22px] mr-2 my-auto shrink-0 align-middle"
          />
        ) : null}
        <div>
          <div className="text-[#fbfbfb] font-semibold text-[14px]">{data.label}</div>
          <div className="text-muted-dark text-[14px]">{data.description || ''}</div>
        </div>
      </div>
    </div>
  );
};

export default function Modal({ form }: {
  form: UseFormReturn<z.infer<typeof modalSchema>>
}) {
  const title = form.watch('title');
  const components = form.watch('components');

  if (typeof title !== 'string') return null;

  return (
      <div className="border bg-surface-high border-[#97979f33] rounded-[12px] w-full max-w-[480px] h-fit max-h-[666px] select-none">
        <div className="flex h-fit justify-between items-center px-6 py-4">
          <div className="flex items-center h-[24px] w-[calc(100%-32px)]">
            <div className="mr-2">
            <FormsLogo size={24} />
            </div>
            <p className="text-[24px] font-semibold overflow-ellipsis overflow-hidden max-w-[342px] whitespace-nowrap">
              {title}
            </p>
          </div>
          <div className="flex relative bottom-[8] left-[16] items-center justify-center size-[40px] cursor-pointer border-[1px] border-transparent hover:border-[rgba(151, 151, 159, 0.16)] text-[rgb(170,170,177)] hover:text-[rgb(251,251,251)] hover:bg-[rgba(151,151,159,0.16)] rounded-[8px] hover:cursor-not-allowed" style={{ transitionDuration: '0.05s, 0.05s, 0.05s', transitionProperty: 'background-color, color, border-color', transitionTimingFunction: 'ease-in, ease-in, ease-in' }}>
            <svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M19.3 20.7a1 1 0 0 0 1.4-1.4L13.42 12l7.3-7.3a1 1 0 0 0-1.42-1.4L12 10.58l-7.3-7.3a1 1 0 0 0-1.4 1.42L10.58 12l-7.3 7.3a1 1 0 1 0 1.42 1.4L12 13.42l7.3 7.3Z"></path></svg>
          </div>
        </div>
        <div className='overflow-hidden scrollbar-modal' style={{ overflow: 'hidden scroll', maxHeight: '526px' }}>
          {components.map((component, index) => {
            switch (component.type) {
              case ComponentType.Label:
                const label = component;
                return <div key={index} className="pr-[18px] pb-[1em] pl-6">
                  <p className="text-[18px] mb-2 text-normal font-[600]">
                    {label.label.trim()}
                    {label.component.required !== false && (
                      <span className="text-text-danger" style={{ paddingLeft: "4px" }}>
                        *
                      </span>
                    )}
                  </p>
                  {label.description && (
                    <p className="text-[14px] text-normal mb-2">
                      {label.description.trim()}
                    </p>
                  )}
                  <div className="relative">
                    {(() => {
                      switch (label.component.type) {
                        case ComponentType.StringSelect:
                          return <ReactSelect
                            className="w-full"
                            isClearable={false}
                            isSearchable={false}
                            isMulti={(typeof label.component.max_values === 'number' ? label.component.max_values : 1) > 1}
                            placeholder={label.component.placeholder || "Make a selection"}
                            noOptionsMessage={() => "No results found"}
                            options={label.component.options.map(option => ({
                              label: option.label,
                              value: option.label,
                              description: option.description || '',
                              emoji: option.emoji
                            }))}
                            components={{ Option: CustomOption }}
                            menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                            menuPosition="fixed"
                            styles={{
                              control: (baseStyles) => ({
                                ...baseStyles,
                                height: "43.5px",
                                background: "var(--custom-input-background-color)",
                                border: "1px solid var(--custom-input-border-color)",
                                "&:hover": {
                                  borderColor: "var(--custom-input-hover-border-color)",
                                },
                                boxShadow: "none",
                                boxSizing: "content-box",
                                borderRadius: '8px'
                              }),
                              input: (baseStyles) => ({
                                ...baseStyles,
                                margin: "0",
                                alignItems: "center",
                                display: "flex",
                                color: "oklab(0.899401 -0.00192499 -0.00481987)"
                              }),
                              valueContainer: (baseStyles) => ({
                                ...baseStyles,
                                height: "43.5px",
                                padding: "0 12px",
                              }),
                              singleValue: (baseStyles) => ({
                                ...baseStyles,
                                color: "oklab(0.899401 -0.00192499 -0.00481987)",
                                margin: "0",
                                alignItems: "center",
                                display: "flex",
                                fontWeight: '600',
                              }),
                              multiValue: (baseStyles) => ({
                                ...baseStyles,
                                backgroundColor: '#28282d',
                                borderRadius: '4px',
                              }),
                              multiValueLabel: (baseStyles) => ({
                                ...baseStyles,
                                color: '#fbfbfb',
                                fontWeight: '600',
                              }),
                              placeholder: (baseStyles) => ({
                                ...baseStyles,
                                alignItems: "center",
                                display: "flex",
                              }),
                              option: (baseStyles, state) => ({
                                ...baseStyles,
                                background: state.isSelected
                                  ? "#28282d"
                                  : state.isFocused
                                    ? "#242429"
                                    : "transparent",
                                padding: "9.75px",
                                display: "flex",
                                ":active": {
                                  background: state.isSelected
                                    ? "#28282d"
                                    : state.isFocused
                                      ? "#242429"
                                      : "transparent",
                                },
                              }),
                              menu: (baseStyles) => ({
                                ...baseStyles,
                                color: "oklab(0.786807 -0.0025776 -0.0110238)",
                                background: "#202024",
                                marginTop: '8px',
                                border: '1px solid #97979f1f',
                                borderRadius: '8px'
                              }),
                              menuList: (baseStyles) => ({
                                ...baseStyles,
                                padding: 0,
                              }),
                              indicatorSeparator: () => ({
                                display: "none",
                              }),
                              dropdownIndicator: (baseStyles, state) => ({
                                ...baseStyles,
                                color: "oklab(0.786807 -0.0025776 -0.0110238)",
                                transform: state.selectProps.menuIsOpen
                                  ? "rotate(180deg)"
                                  : "rotate(0)",
                                "&:hover": {
                                  color: "oklab(0.786807 -0.0025776 -0.0110238)",
                                },
                              }),
                              menuPortal: (baseStyles) => ({ ...baseStyles, zIndex: 9999 }),
                            }}
                          />;

                        case ComponentType.TextInput:
                          return (label.component.style === 1 ? (
                            <Input
                              className="text-custom-input-text-color bg-custom-input-background-color border border-custom-input-border-color hover:border-custom-input-hover-border-color placeholder-[#807c84] h-[40px] rounded-[8px] text-[16px] w-full focus:border-custom-input-focus-border-color focus:ring-0 focus:ring-transparent focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                              style={{ transition: 'border-color .2s ease-in-out' }}
                              placeholder={(label.component.placeholder || '').trim()}
                              defaultValue={(label.component.value || '').trim()}
                            />
                          ) : (
                            <Textarea
                              className="text-custom-input-text-color bg-custom-input-background-color border border-custom-input-border-color hover:border-custom-input-hover-border-color placeholder-[#807c84] p-[10px] py-[6px] pr-[38.920px] rounded-[8px] text-[16px] resize-none focus:border-custom-input-focus-border-color w-full focus:ring-0 focus:ring-transparent focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
                              style={{ minHeight: "85px", transition: 'border-color .2s ease-in-out' }}
                              placeholder={label.component.placeholder}
                              defaultValue={label.component.value}
                              onInput={handleTextAreaInput}
                            />
                          ));

                        case ComponentType.UserSelect:
                          return <ReactSelect
                            className="w-full"
                            isClearable={true}
                            isSearchable={true}
                            isMulti={(typeof label.component.max_values === 'number' ? label.component.max_values : 1) > 1}
                            placeholder={label.component.placeholder || "Make a selection"}
                            noOptionsMessage={() => "In Discord you will be able to select users here"}
                            menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                            menuPosition="fixed"
                            styles={{
                              control: (baseStyles) => ({
                                ...baseStyles,
                                height: "43.5px",
                                background: "var(--custom-input-background-color)",
                                border: "1px solid var(--custom-input-border-color)",
                                "&:hover": {
                                  borderColor: "var(--custom-input-hover-border-color)",
                                },
                                boxShadow: "none",
                                boxSizing: "content-box",
                                borderRadius: '8px'
                              }),
                              input: (baseStyles) => ({
                                ...baseStyles,
                                margin: "0",
                                alignItems: "center",
                                display: "flex",
                                color: "oklab(0.899401 -0.00192499 -0.00481987)"
                              }),
                              valueContainer: (baseStyles) => ({
                                ...baseStyles,
                                height: "43.5px",
                                padding: "0 12px",
                              }),
                              singleValue: (baseStyles) => ({
                                ...baseStyles,
                                color: "oklab(0.899401 -0.00192499 -0.00481987)",
                                margin: "0",
                                alignItems: "center",
                                display: "flex",
                                fontWeight: '600',
                              }),
                              multiValue: (baseStyles) => ({
                                ...baseStyles,
                                backgroundColor: '#28282d',
                                borderRadius: '4px',
                              }),
                              multiValueLabel: (baseStyles) => ({
                                ...baseStyles,
                                color: '#fbfbfb',
                                fontWeight: '600',
                              }),
                              placeholder: (baseStyles) => ({
                                ...baseStyles,
                                alignItems: "center",
                                display: "flex",
                              }),
                              option: (baseStyles, state) => ({
                                ...baseStyles,
                                background: state.isSelected
                                  ? "#28282d"
                                  : state.isFocused
                                    ? "#242429"
                                    : "transparent",
                                padding: "9.75px",
                                display: "flex",
                                ":active": {
                                  background: state.isSelected
                                    ? "#28282d"
                                    : state.isFocused
                                      ? "#242429"
                                      : "transparent",
                                },
                              }),
                              menu: (baseStyles) => ({
                                ...baseStyles,
                                color: "oklab(0.786807 -0.0025776 -0.0110238)",
                                background: "#202024",
                                marginTop: '8px',
                                border: '1px solid #97979f1f',
                                borderRadius: '8px'
                              }),
                              menuList: (baseStyles) => ({
                                ...baseStyles,
                                padding: 0,
                              }),
                              indicatorSeparator: () => ({
                                display: "none",
                              }),
                              dropdownIndicator: (baseStyles, state) => ({
                                ...baseStyles,
                                color: "oklab(0.786807 -0.0025776 -0.0110238)",
                                transform: state.selectProps.menuIsOpen
                                  ? "rotate(180deg)"
                                  : "rotate(0)",
                                "&:hover": {
                                  color: "oklab(0.786807 -0.0025776 -0.0110238)",
                                },
                              }),
                              menuPortal: (baseStyles) => ({ ...baseStyles, zIndex: 9999 }),
                            }}
                          />;

                        case ComponentType.ChannelSelect:
                          return <ReactSelect
                            className="w-full"
                            isClearable={true}
                            isSearchable={true}
                            isMulti={(typeof label.component.max_values === 'number' ? label.component.max_values : 1) > 1}
                            placeholder={label.component.placeholder || "Make a selection"}
                            noOptionsMessage={() => "In Discord you will be able to select channels here"}
                            formatOptionLabel={({ label, type }) => (
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span>{getChannelIcon(type)}</span>
                                <span>{label}</span>
                              </div>
                            )}
                            options={[]}
                            menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                            menuPosition="fixed"
                            styles={{
                              control: (baseStyles) => ({
                                ...baseStyles,
                                height: "43.5px",
                                background: "var(--custom-input-background-color)",
                                border: "1px solid var(--custom-input-border-color)",
                                "&:hover": {
                                  borderColor: "var(--custom-input-hover-border-color)",
                                },
                                boxShadow: "none",
                                boxSizing: "content-box",
                                borderRadius: '8px'
                              }),
                              input: (baseStyles) => ({
                                ...baseStyles,
                                margin: "0",
                                alignItems: "center",
                                display: "flex",
                                color: "oklab(0.899401 -0.00192499 -0.00481987)"
                              }),
                              valueContainer: (baseStyles) => ({
                                ...baseStyles,
                                height: "43.5px",
                                padding: "0 12px",
                              }),
                              singleValue: (baseStyles) => ({
                                ...baseStyles,
                                color: "oklab(0.899401 -0.00192499 -0.00481987)",
                                margin: "0",
                                alignItems: "center",
                                display: "flex",
                                fontWeight: '600',
                              }),
                              multiValue: (baseStyles) => ({
                                ...baseStyles,
                                backgroundColor: '#28282d',
                                borderRadius: '4px',
                              }),
                              multiValueLabel: (baseStyles) => ({
                                ...baseStyles,
                                color: '#fbfbfb',
                                fontWeight: '600',
                              }),
                              placeholder: (baseStyles) => ({
                                ...baseStyles,
                                alignItems: "center",
                                display: "flex",
                              }),
                              option: (baseStyles, state) => ({
                                ...baseStyles,
                                background: state.isSelected
                                  ? "#28282d"
                                  : state.isFocused
                                    ? "#242429"
                                    : "transparent",
                                padding: "9.75px",
                                display: "flex",
                                ":active": {
                                  background: state.isSelected
                                    ? "#28282d"
                                    : state.isFocused
                                      ? "#242429"
                                      : "transparent",
                                },
                              }),
                              menu: (baseStyles) => ({
                                ...baseStyles,
                                color: "oklab(0.786807 -0.0025776 -0.0110238)",
                                background: "#202024",
                                marginTop: '8px',
                                border: '1px solid #97979f1f',
                                borderRadius: '8px'
                              }),
                              menuList: (baseStyles) => ({
                                ...baseStyles,
                                padding: 0,
                              }),
                              indicatorSeparator: () => ({
                                display: "none",
                              }),
                              dropdownIndicator: (baseStyles, state) => ({
                                ...baseStyles,
                                color: "oklab(0.786807 -0.0025776 -0.0110238)",
                                transform: state.selectProps.menuIsOpen
                                  ? "rotate(180deg)"
                                  : "rotate(0)",
                                "&:hover": {
                                  color: "oklab(0.786807 -0.0025776 -0.0110238)",
                                },
                              }),
                              menuPortal: (baseStyles) => ({ ...baseStyles, zIndex: 9999 }),
                            }}
                          />;

                        case ComponentType.RoleSelect:
                          return <ReactSelect
                            className="w-full"
                            isClearable={true}
                            isSearchable={true}
                            placeholder={label.component.placeholder || "Select a role"}
                            noOptionsMessage={() => "In Discord you will be able to select roles here"}
                            name={"Select Role"}
                            formatOptionLabel={({ label, color }) => (
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <svg role="img" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill={color} fillRule="evenodd" d="M3.47 5.18c.27-.4.64-.74 1.1-.96l6.09-3.05a3 3 0 0 1 2.68 0l6.1 3.05A2.83 2.83 0 0 1 21 6.75v3.5a14.17 14.17 0 0 1-8.42 12.5c-.37.16-.79.16-1.16 0A14.18 14.18 0 0 1 3 9.77V6.75c0-.57.17-1.11.47-1.57Zm2.95 10.3A12.18 12.18 0 0 0 12 20.82a12.18 12.18 0 0 0 5.58-5.32A9.49 9.49 0 0 0 12.47 14h-.94c-1.88 0-3.63.55-5.11 1.49ZM12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" clipRule="evenodd"></path></svg>
                                <span>{label}</span>
                              </div>
                            )}
                            options={[]}
                            menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                            menuPosition="fixed"
                            styles={{
                              control: (baseStyles) => ({
                                ...baseStyles,
                                height: "43.5px",
                                background: "var(--custom-input-background-color)",
                                border: "1px solid var(--custom-input-border-color)",
                                "&:hover": {
                                  borderColor: "var(--custom-input-hover-border-color)",
                                },
                                boxShadow: "none",
                                boxSizing: "content-box",
                                borderRadius: '8px'
                              }),
                              input: (baseStyles) => ({
                                ...baseStyles,
                                margin: "0",
                                alignItems: "center",
                                display: "flex",
                                color: "oklab(0.899401 -0.00192499 -0.00481987)"
                              }),
                              valueContainer: (baseStyles) => ({
                                ...baseStyles,
                                height: "43.5px",
                                padding: "0 12px",
                              }),
                              singleValue: (baseStyles) => ({
                                ...baseStyles,
                                color: "oklab(0.899401 -0.00192499 -0.00481987)",
                                margin: "0",
                                alignItems: "center",
                                display: "flex",
                              }),
                              placeholder: (baseStyles) => ({
                                ...baseStyles,
                                alignItems: "center",
                                display: "flex",
                              }),
                              option: (baseStyles, state) => ({
                                ...baseStyles,
                                background: state.isSelected
                                  ? "#28282d"
                                  : state.isFocused
                                    ? "#242429"
                                    : "transparent",
                                padding: "9.75px",
                                display: "flex",
                                ":active": {
                                  background: state.isSelected
                                    ? "#28282d"
                                    : state.isFocused
                                      ? "#242429"
                                      : "transparent",
                                },
                              }),
                              menu: (baseStyles) => ({
                                ...baseStyles,
                                color: "oklab(0.786807 -0.0025776 -0.0110238)",
                                background: "#202024",
                                marginTop: '8px',
                                border: '1px solid #97979f1f',
                                borderRadius: '8px'
                              }),
                              menuList: (baseStyles) => ({
                                ...baseStyles,
                                padding: 0,
                              }),
                              indicatorSeparator: () => ({
                                display: "none",
                              }),
                              dropdownIndicator: (baseStyles, state) => ({
                                ...baseStyles,
                                color: "oklab(0.786807 -0.0025776 -0.0110238)",
                                transform: state.selectProps.menuIsOpen
                                  ? "rotate(180deg)"
                                  : "rotate(0)",
                                "&:hover": {
                                  color: "oklab(0.786807 -0.0025776 -0.0110238)",
                                },
                              }),
                              menuPortal: (baseStyles) => ({ ...baseStyles, zIndex: 9999 }),
                            }}
                          />;

                        case ComponentType.MentionableSelect:
                          return <ReactSelect
                            className="w-full"
                            isClearable={true}
                            isSearchable={true}
                            isMulti={(typeof label.component.max_values === 'number' ? label.component.max_values : 1) > 1}
                            placeholder={label.component.placeholder || "Make a selection"}
                            noOptionsMessage={() => "In Discord you will be able to select users & roles here"}
                            components={{ Option: CustomOption }}
                            menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                            menuPosition="fixed"
                            styles={{
                              control: (baseStyles) => ({
                                ...baseStyles,
                                height: "43.5px",
                                background: "var(--custom-input-background-color)",
                                border: "1px solid var(--custom-input-border-color)",
                                "&:hover": {
                                  borderColor: "var(--custom-input-hover-border-color)",
                                },
                                boxShadow: "none",
                                boxSizing: "content-box",
                                borderRadius: '8px'
                              }),
                              input: (baseStyles) => ({
                                ...baseStyles,
                                margin: "0",
                                alignItems: "center",
                                display: "flex",
                                color: "oklab(0.899401 -0.00192499 -0.00481987)"
                              }),
                              valueContainer: (baseStyles) => ({
                                ...baseStyles,
                                height: "43.5px",
                                padding: "0 12px",
                              }),
                              singleValue: (baseStyles) => ({
                                ...baseStyles,
                                color: "oklab(0.899401 -0.00192499 -0.00481987)",
                                margin: "0",
                                alignItems: "center",
                                display: "flex",
                                fontWeight: '600',
                              }),
                              multiValue: (baseStyles) => ({
                                ...baseStyles,
                                backgroundColor: '#28282d',
                                borderRadius: '4px',
                              }),
                              multiValueLabel: (baseStyles) => ({
                                ...baseStyles,
                                color: '#fbfbfb',
                                fontWeight: '600',
                              }),
                              placeholder: (baseStyles) => ({
                                ...baseStyles,
                                alignItems: "center",
                                display: "flex",
                              }),
                              option: (baseStyles, state) => ({
                                ...baseStyles,
                                background: state.isSelected
                                  ? "#28282d"
                                  : state.isFocused
                                    ? "#242429"
                                    : "transparent",
                                padding: "9.75px",
                                display: "flex",
                                ":active": {
                                  background: state.isSelected
                                    ? "#28282d"
                                    : state.isFocused
                                      ? "#242429"
                                      : "transparent",
                                },
                              }),
                              menu: (baseStyles) => ({
                                ...baseStyles,
                                color: "oklab(0.786807 -0.0025776 -0.0110238)",
                                background: "#202024",
                                marginTop: '8px',
                                border: '1px solid #97979f1f',
                                borderRadius: '8px'
                              }),
                              menuList: (baseStyles) => ({
                                ...baseStyles,
                                padding: 0,
                              }),
                              indicatorSeparator: () => ({
                                display: "none",
                              }),
                              dropdownIndicator: (baseStyles, state) => ({
                                ...baseStyles,
                                color: "oklab(0.786807 -0.0025776 -0.0110238)",
                                transform: state.selectProps.menuIsOpen
                                  ? "rotate(180deg)"
                                  : "rotate(0)",
                                "&:hover": {
                                  color: "oklab(0.786807 -0.0025776 -0.0110238)",
                                },
                              }),
                              menuPortal: (baseStyles) => ({ ...baseStyles, zIndex: 9999 }),
                            }}
                          />;

                        case 19:
                          return <div className="bg-custom-input-background-color border border-custom-input-border-color hover:border-custom-input-hover-border-color rounded-[8px] p-2 h-[122px] flex items-center justify-center gap-[8px] flex-col">
                            <svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="#fbfbfb" d="M13.82 21.7c.17.05.14.3-.04.3H6a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h7.5c.28 0 .5.22.5.5V5a5 5 0 0 0 5 5h2.5c.28 0 .5.22.5.5v2.3a.4.4 0 0 1-.68.27l-.2-.2a3 3 0 0 0-4.24 0l-4 4a3 3 0 0 0 0 4.25c.3.3.6.46.94.58Z"></path><path fill="#fbfbfb" d="M21.66 8c.03 0 .05-.03.04-.06a3 3 0 0 0-.58-.82l-4.24-4.24a3 3 0 0 0-.82-.58.04.04 0 0 0-.06.04V5a3 3 0 0 0 3 3h2.66ZM18.3 14.3a1 1 0 0 1 1.4 0l4 4a1 1 0 0 1-1.4 1.4L20 17.42V23a1 1 0 1 1-2 0v-5.59l-2.3 2.3a1 1 0 0 1-1.4-1.42l4-4Z"></path></svg>
                            <div className="text-[16px] text-[#94959c] font-medium">Drop file{((typeof label.component.max_values === 'number') && (label.component.max_values > 1)) ? 's' : ''} here or <span className="text-[#5197ed] hover:underline hover:cursor-not-allowed">browse</span></div>
                            <div className="text-[12px] text-[#94959c] font-medium">Upload {((typeof label.component.max_values === 'number') && (label.component.max_values > 1)) ? `up to ${label.component.max_values} files` : 'a file'} under 10MB.</div>
                          </div>;

                        default:
                          return <></>;
                      }
                    })()}
                  </div>
                </div>;

              case ComponentType.TextDisplay:
                const textDisplay = component;
                return <div key={index} className="pr-[18px] pb-[1em] pl-6">
                  <div
                    className="contents text-white dark:text-primary-230 font-normal leading-[1.375] whitespace-pre-line break-all space-y-[2px]"
                    style={{
                      // @ts-expect-error CSS variable
                      "--font-size": "1rem",
                    }}
                  >
                    <Markdown
                      content={textDisplay.content}
                      features="full"
                    />
                  </div>
                </div>;

              default:
                return null;
            }
          })}
        </div>
        <div className="flex gap-2 p-[24px] pt-[8px]">
          <Button
            variant="secondary"
            className="flex-1 w-full h-[38px] font-medium hover:cursor-not-allowed"
          >
            Cancel
          </Button>
          <Button className="flex-1 w-full h-[38px] font-medium hover:cursor-not-allowed">
            Submit
          </Button>
        </div>
      </div>
  );
}
