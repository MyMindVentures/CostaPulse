import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge } from "./badge";

const meta = {
  title: "UI/Badge",
  component: Badge,
  args: {
    children: "Available"
  }
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Secondary: Story = {
  args: { variant: "secondary" }
};

export const Outline: Story = {
  args: { variant: "outline" }
};

export const Muted: Story = {
  args: { variant: "muted" }
};
