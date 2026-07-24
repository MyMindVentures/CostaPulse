import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EmptyState } from "./empty-state";

const meta = {
  title: "Shared/EmptyState",
  component: EmptyState,
  args: {
    title: "No experiences found",
    description: "Try adjusting filters or check back later."
  }
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAction: Story = {
  args: {
    actionLabel: "Browse catalog",
    actionHref: "/experiences"
  }
};
