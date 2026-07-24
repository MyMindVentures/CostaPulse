import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LoadingState } from "./loading-state";

const meta = {
  title: "Shared/LoadingState",
  component: LoadingState,
  args: {
    label: "Loading experiences"
  }
} satisfies Meta<typeof LoadingState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleRow: Story = {
  args: { rows: 1 }
};
