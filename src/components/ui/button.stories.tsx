import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./button";

const meta = {
  title: "UI/Button",
  component: Button,
  args: {
    children: "Book experience"
  }
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Coral: Story = {
  args: { variant: "coral" }
};

export const Outline: Story = {
  args: { variant: "outline" }
};

export const Light: Story = {
  args: { variant: "light" }
};

export const Disabled: Story = {
  args: { disabled: true }
};
