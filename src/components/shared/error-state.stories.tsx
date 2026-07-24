import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { ErrorState } from "./error-state";

const meta = {
  title: "Shared/ErrorState",
  component: ErrorState,
  args: {
    title: "Something went wrong",
    description: "We could not load this catalog. Please try again.",
    retryLabel: "Retry",
    onRetry: fn()
  }
} satisfies Meta<typeof ErrorState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutRetry: Story = {
  args: {
    retryLabel: undefined,
    onRetry: undefined
  }
};
