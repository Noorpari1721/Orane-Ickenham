export function getDurationMinutes(
  value: unknown
): number {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return Math.max(
      0,
      value
    );
  }

  const raw =
    String(value ?? "")
      .toLowerCase()
      .trim();

  if (!raw) {
    return 0;
  }

  const hoursMatch =
    raw.match(
      /(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)\b/
    );

  const minutesMatch =
    raw.match(
      /(\d+(?:\.\d+)?)\s*(?:m|min|mins|minute|minutes)\b/
    );

  let minutes = 0;

  if (hoursMatch) {
    minutes +=
      Number(hoursMatch[1]) * 60;
  }

  if (minutesMatch) {
    minutes +=
      Number(minutesMatch[1]);
  }

  if (
    !hoursMatch &&
    !minutesMatch
  ) {
    const numeric =
      Number.parseFloat(raw);

    if (
      Number.isFinite(numeric)
    ) {
      minutes = numeric;
    }
  }

  return Math.round(
    Math.max(
      0,
      minutes
    )
  );
}

export function getTotalDurationMinutes(
  services: unknown
): number {
  if (!Array.isArray(services)) {
    return 0;
  }

  return services.reduce(
    (
      total,
      service
    ) => {
      if (
        !service ||
        typeof service !== "object"
      ) {
        return total;
      }

      const item =
        service as {
          duration?: unknown;
        };

      return (
        total +
        getDurationMinutes(
          item.duration
        )
      );
    },
    0
  );
}

export function formatDuration(
  totalMinutes: number
): string {
  const minutes =
    Math.round(
      Math.max(
        0,
        totalMinutes
      )
    );

  if (minutes <= 0) {
    return "--";
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  const remainingMinutes =
    minutes % 60;

  if (hours <= 0) {
    return `${minutes} min`;
  }

  if (remainingMinutes <= 0) {
    return hours === 1
      ? "1 hour"
      : `${hours} hours`;
  }

  return `${
    hours === 1
      ? "1 hour"
      : `${hours} hours`
  } ${remainingMinutes} min`;
}
