import { render, screen, fireEvent, act } from "@testing-library/react";
import { CreatePollForm } from "./create-poll-form";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe("CreatePollForm", () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it("renders the form correctly", () => {
    render(<CreatePollForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/Poll Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByText(/Poll Options/i)).toBeInTheDocument();
    expect(screen.getByText(/Create Poll/i)).toBeInTheDocument();
  });

  it("allows adding and removing options", () => {
    render(<CreatePollForm onSubmit={mockOnSubmit} />);

    const addOptionButton = screen.getByText(/Add Option/i);
    act(() => {
      fireEvent.click(addOptionButton);
    });
    expect(screen.getAllByPlaceholderText(/Option/i)).toHaveLength(3);

    const removeOptionButtons = screen.getAllByRole("button", {
      name: /Remove option/i,
    });
    act(() => {
      fireEvent.click(removeOptionButtons[0]);
    });
    expect(screen.getAllByPlaceholderText(/Option/i)).toHaveLength(2);
  });

  it("shows validation errors for invalid input", async () => {
    render(<CreatePollForm onSubmit={mockOnSubmit} />);

    await act(async () => {
      fireEvent.click(screen.getByText(/Create Poll/i));
    });

    expect(
      await screen.findByText(/Poll title is required/i),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/At least 2 options are required/i),
    ).toBeInTheDocument();
  });

  it("calls onSubmit with the correct data for valid input", async () => {
    render(<CreatePollForm onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByLabelText(/Poll Title/i), {
      target: { value: "Test Poll" },
    });
    fireEvent.change(screen.getAllByPlaceholderText(/Option/i)[0], {
      target: { value: "Option 1" },
    });
    fireEvent.change(screen.getAllByPlaceholderText(/Option/i)[1], {
      target: { value: "Option 2" },
    });

    await act(async () => {
      fireEvent.click(screen.getByText(/Create Poll/i));
    });

    expect(mockOnSubmit).toHaveBeenCalledWith({
      title: "Test Poll",
      description: undefined,
      options: ["Option 1", "Option 2"],
      allowMultipleVotes: false,
      expiresAt: undefined,
    });
  });
});
