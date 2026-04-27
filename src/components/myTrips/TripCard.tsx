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
            className="w-full rounded-lg border border-border bg-card text-card-foreground overflow-hidden flex flex-col text-left disabled:opacity-70 disabled:cursor-not-allowed enabled:cursor-pointer enabled:hover:shadow-sm enabled:hover:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
            {/* Image section */}
            <div className="w-full aspect-183/90 overflow-hidden">
                <img
                    src={imageUrl}
                    alt={name}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Info section */}
            <div className="px-2.5 pt-2 pb-2.5 flex flex-col gap-1">
                <p className="text-sm font-bold text-primary truncate leading-tight">
                    {name}
                </p>

                <div className="flex items-center justify-between">
                    <span className="text-xs text-primary/80">
                        {lastEdited}
                    </span>

                    {/* Overlapping collaborator avatars */}
                    <div className="flex items-center">
                        {visibleAvatars.map((collab, i) => (
                            <img
                                key={collab.id}
                                src={collab.avatarUrl}
                                alt={`Collaborator ${i + 1}`}
                                className="size-5.75 rounded-full object-cover border-2 border-background -ml-1.75 first:ml-0"
                            />
                        ))}

                        {overflowCount > 0 && (
                            <div className="size-5.75 rounded-full bg-primary border-2 border-background -ml-1.75 flex items-center justify-center text-primary-foreground font-semibold text-xs shrink-0">
                                +{overflowCount}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </button>
    );
}
