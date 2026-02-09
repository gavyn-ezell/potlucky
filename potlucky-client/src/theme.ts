import { Accordion, Button, Card, Container, createTheme, Input, InputWrapper, Modal, Paper, rem, Select, Table, Tabs, Text, Textarea } from "@mantine/core";
import type { CSSVariablesResolver, MantineColorsTuple, MantineThemeOverride, TextInput } from "@mantine/core";
import "../src/styles.css";
import { DateTimePicker } from "@mantine/dates";

// Mantine themes use a 10-color palette to support different variants and light/dark schemes.
// https://help.mantine.dev/q/ten-shades-per-color#why-is-it-required-to-have-10-shades-per-color
const primaryColor: MantineColorsTuple = [
  "#FFEDE6",
  "#FFD9CC",
  "#FFC5B3",
  "#FFB199",
  "#FF9D80",
  "#FF8966",
  "#FF754D",
  "#FF6133",
  "#FF4D1A",
  "#F97543"
];

// Configures the Container Component supported widths
const CONTAINER_SIZES: Record<string, string> = {
  xxs: rem("200px"),
  xs: rem("300px"),
  sm: rem("400px"),
  md: rem("500px"),
  lg: rem("600px"),
  xl: rem("1400px"),
  xxl: rem("1600px"),
};

export const cssVarResolver: CSSVariablesResolver = () => ({
  /** Shared CSS variables that should be accessible independent from color scheme */
  variables: {},
  /** CSS variables available only in dark color scheme */
  light: {
    '--mantine-color-text': "var(--text-dark)",
  },
  /** CSS variables available only in light color scheme */
  dark: {
    '--mantine-color-text': "var(--text-light)",
  },
})

export const mantineTheme: MantineThemeOverride = createTheme({
  /** Put your mantine theme override here */
  fontFamily: 'Geist, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif',
  breakpoints: {
    xs: '30em',
    sm: '48em',
    md: '64em',
    lg: '74em',
    xl: '90em',
  },

  fontSizes: {
    xs: rem("12px"),
    sm: rem("14px"),
    md: rem("16px"),
    lg: rem("18px"),
    xl: rem("20px"),
    "2xl": rem("24px"),
    "3xl": rem("30px"),
    "4xl": rem("36px"),
    "5xl": rem("48px"),
  },

  spacing: {
    "3xs": rem("4px"),
    "2xs": rem("8px"),
    xs: rem("10px"),
    sm: rem("12px"),
    md: rem("16px"),
    lg: rem("20px"),
    xl: rem("24px"),
    "2xl": rem("28px"),
    "3xl": rem("32px"),
    "4xl": rem("36px"),
    "5xl": rem("40px"),
    "6xl": rem("44px"),
  },

  colors: {
    primaryColor,
  },
  primaryColor: 'primaryColor',

  /** Put your mantine component prop/style overrides here */
  components: {
    Accordion: Accordion.extend({
      defaultProps: {
        radius: "md"
      },
      styles: {
        root: {
          background: "var(--bg-primary)",
        }
      }
    }),
    Table: Table.extend({
      defaultProps: {
        striped: true,
      },
      styles: {
        table: {
          "tbody tr:nth-of-type(odd)": {
            backgroundColor: "white",
          },
          "tbody tr:nth-of-type(even)": {
            backgroundColor: "transparent",
          },
        },
      },
    }),
    Tabs: Tabs.extend({
      styles: {
        root: {
          background: "var(--bg-primary)",
          border: "2px solid var(--border-primary)",
          borderRadius: "8px"
        },
      }
    }),
    Container: Container.extend({
      vars: (_, { size, fluid }) => ({
        root: {
          "--container-size": fluid
            ? "100%"
            : size !== undefined && size in CONTAINER_SIZES
              ? CONTAINER_SIZES[size]
              : rem(size),
        },
      }),
    }),
    Paper: Paper.extend({
      defaultProps: {
        p: "xl",
        shadow: "xl",
        radius: "lg",
        withBorder: true,
        bd: "2px solid var(--border-primary)",
      },
      styles: {
        root: {
          background: "var(--bg-primary)",
        }
      }
    }),
    Card: Card.extend({
      defaultProps: {
        p: "xl",
        shadow: "xl",
        radius: "lg",
        withBorder: true,
      },
      styles: {
        root: {
          background: "var(--bg-primary)",
        },
      },
    }),
    Select: Select.extend({
      defaultProps: {
        checkIconPosition: "right",
        radius: "sm"
      },
      styles: {
        input: {
          background: "var(--bg-input-dark)",
          border: "2px solid var(--border-primary)",
        },
        dropdown: {
          borderRadius: "4px",
          border: "2px solid var(--border-primary)",
        }
      },
    }),
    Button: Button.extend({
      defaultProps: {
        radius: "md"
      },
    }),
    TextInput: Input.extend({
      defaultProps: {
        radius: "sm",
      },
      styles: {
        input: {
          background: "var(--bg-input-dark)",
          border: "2px solid var(--border-primary)",
        },
      },
    }),
    Textarea: Textarea.extend({
      defaultProps: {
        radius: "sm"
      },
      styles: {
        input: {
          background: "var(--bg-input-dark)",
          border: "2px solid var(--border-primary)",
        },
      },
    }),
    DateTimePicker: DateTimePicker.extend({
      defaultProps: {
        radius: "sm"
      },
      styles: {
        input: {
          background: "var(--bg-input-dark)",
          border: "2px solid var(--border-primary)",
        },
      },
    }),
    Modal: Modal.extend({
      defaultProps: {
        radius: "md"
      },
      styles: {
        title: {
          padding: "0px"
        },
        header: {
          background: "var(--bg-primary)",
        },
        body: {
          background: "var(--bg-primary)",
          // border: "2px solid var(--border-primary)",
        },
      },
    }),
  },
  other: {
    style: "mantine",
  },
});