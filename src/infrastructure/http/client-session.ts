let sessionRequest: Promise<void> | undefined;

export function ensureGuestSession(): Promise<void> {
  sessionRequest ??= fetch("/api/session", { credentials: "same-origin" }).then(
    (response) => {
      if (!response.ok) {
        sessionRequest = undefined;
        throw new Error("Could not start guest session");
      }
    },
  );

  return sessionRequest;
}
