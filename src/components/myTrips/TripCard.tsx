export interface Collaborator {
    id: string;
    avatarUrl: string;
}

export interface TripCardProps {
    name: string;
    imageUrl: string;
    lastEdited: string;
    collaborators: Collaborator[];
    onClick?: () => void;
    clickable?: boolean;
}

const MAX_VISIBLE_AVATARS = 2;

export default function TripCard({
    name,
    imageUrl,
    lastEdited,
    collaborators,
    onClick,
    clickable = false,
}: TripCardProps) {
    const visibleAvatars = collaborators.slice(0, MAX_VISIBLE_AVATARS);
    const overflowCount = collaborators.length - MAX_VISIBLE_AVATARS;

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={!clickable}
            className="flex w-full flex-col overflow-hidden rounded-lg border border-border bg-card text-left text-card-foreground disabled:cursor-not-allowed disabled:opacity-70 enabled:cursor-pointer enabled:hover:border-ring enabled:hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
            {/* Image section */}
            <div className="aspect-183/90 w-full overflow-hidden">
                <img
                    src={imageUrl}
                    alt={name}
                    className="h-full w-full object-cover"
                />
            </div>

            {/* Info section */}
            <div className="flex min-w-0 flex-col gap-1 px-2.5 pt-2 pb-2.5">
                <p className="truncate text-xs font-bold leading-tight text-primary sm:text-sm">
                    {name}
                </p>

                <div className="flex min-w-0 items-center justify-between gap-1.5">
                    <span className="min-w-0 truncate text-[11px] text-primary/80 sm:text-xs">
                        {lastEdited}
                    </span>

                    {/* Overlapping collaborator avatars */}
                    <div className="flex shrink-0 items-center">
                        {visibleAvatars.map((collab, i) => (
                            <img
                                key={collab.id}
                                src={collab.avatarUrl}
                                alt={`Collaborator ${i + 1}`}
                                className="size-5 rounded-full border-2 border-background object-cover -ml-1.5 first:ml-0 sm:size-5.75 sm:-ml-1.75"
                            />
                        ))}

                        {overflowCount > 0 && (
                            <div className="flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-background bg-primary text-[10px] font-semibold text-primary-foreground -ml-1.5 sm:size-5.75 sm:text-xs sm:-ml-1.75">
                                +{overflowCount}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </button>
    );
}
