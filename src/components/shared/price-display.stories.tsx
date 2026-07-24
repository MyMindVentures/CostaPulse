import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PriceDisplay } from "./price-display";

const meta = {
  title: "Shared/PriceDisplay",
  component: PriceDisplay,
  args: {
    amountMinor: 8900,
    currency: "EUR",
    locale: "en-GB"
  }
} satisfies Meta<typeof PriceDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MissingData: Story = {
  args: {
    amountMinor: null,
    currency: null,
    fallback: "Price on request"
  }
};
