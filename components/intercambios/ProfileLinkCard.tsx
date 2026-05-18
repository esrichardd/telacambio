import CopyLinkButton from "./CopyLinkButton";

const BASE_URL = "telacambio.co";

interface ProfileLinkCardProps {
  username: string;
}

export default function ProfileLinkCard({ username }: ProfileLinkCardProps) {
  const profileUrl = `https://${BASE_URL}/${username}`;
  const displayUrl = `${BASE_URL}/${username}`;

  return (
    <div className="mx-4 rounded-2xl bg-surface border border-border p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-brand"
          >
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            Tu link de perfil
          </p>
          <p className="text-xs text-muted">Compártelo con tus amigos</p>
        </div>
      </div>

      {/* URL pill */}
      <div className="flex items-center gap-2 bg-surface-subtle rounded-xl px-4 py-3 mb-4">
        <span className="text-brand text-sm font-medium truncate">
          {displayUrl}
        </span>
      </div>

      {/* Copy button */}
      <CopyLinkButton url={profileUrl} />

      {/* Helper text */}
      <p className="text-xs text-muted text-center mt-3 leading-relaxed">
        Tu amigo podrá ver tu colección y coordinar un intercambio contigo
      </p>
    </div>
  );
}
