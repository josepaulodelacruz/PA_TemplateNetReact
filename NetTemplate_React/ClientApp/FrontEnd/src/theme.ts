import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Container,
  createTheme,
  Modal,
  Paper,
  rem,
  Select,
  Table,
  TextInput,
  PasswordInput,
  Tooltip,
} from "@mantine/core";
import type { MantineThemeOverride } from "@mantine/core";

const CONTAINER_SIZES: Record<string, string> = {
  xxs: rem("200px"),
  xs: rem("300px"),
  sm: rem("400px"),
  md: rem("500px"),
  lg: rem("600px"),
  xl: rem("1400px"),
  xxl: rem("1600px"),
};

export const theme: MantineThemeOverride = createTheme({
  fontFamily:
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  fontFamilyMonospace:
    "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
  headings: {
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontWeight: "600",
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
  },
  defaultRadius: "md",
  cursorType: "pointer",
  autoContrast: true,

  colors: {
    // Brand palette built around the original #00595C deep teal
    brand: [
      "#e6f7f7",
      "#c9ebeb",
      "#9fdcdd",
      "#6ec9cb",
      "#42b5b8",
      "#1ba5a8",
      "#0d9295",
      "#007b7e",
      "#00696c",
      "#00595c",
    ],
  },
  primaryColor: "brand",
  primaryShade: { light: 7, dark: 5 },

  components: {
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
        p: "md",
        shadow: "xs",
        radius: "md",
        withBorder: true,
      },
    }),
    Card: Card.extend({
      defaultProps: {
        p: "xl",
        shadow: "xs",
        radius: "lg",
        withBorder: true,
      },
    }),
    Button: Button.extend({
      defaultProps: {
        radius: "md",
      },
    }),
    ActionIcon: ActionIcon.extend({
      defaultProps: {
        radius: "md",
      },
    }),
    Badge: Badge.extend({
      styles: {
        label: { fontWeight: 600 },
      },
    }),
    Tooltip: Tooltip.extend({
      defaultProps: {
        withArrow: true,
      },
    }),
    Modal: Modal.extend({
      defaultProps: {
        radius: "lg",
        centered: true,
        overlayProps: { backgroundOpacity: 0.55, blur: 3 },
      },
    }),
    Table: Table.extend({
      defaultProps: {
        highlightOnHover: true,
        verticalSpacing: "sm",
      },
    }),
    TextInput: TextInput.extend({
      defaultProps: {
        radius: "md",
      },
    }),
    PasswordInput: PasswordInput.extend({
      defaultProps: {
        radius: "md",
      },
    }),
    Select: Select.extend({
      defaultProps: {
        checkIconPosition: "right",
        radius: "md",
      },
    }),
  },
  other: {
    style: "mantine",
  },
});
