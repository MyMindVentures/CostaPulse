/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { NextIntlClientProvider } from "next-intl";
import { ExtrasStep } from "./extras-step";
import messages from "../../../../messages/en.json";

afterEach(() => cleanup());

describe("ExtrasStep", () => {
  it("shows a real empty state when no extras exist", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <ExtrasStep onBack={() => undefined} onContinue={() => undefined} />
      </NextIntlClientProvider>
    );

    expect(
      screen.getByText(/No extras are available for this experience yet/i)
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /Continue to review/i })
    ).toBeTruthy();
  });
});
