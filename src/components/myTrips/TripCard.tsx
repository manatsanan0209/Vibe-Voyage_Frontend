export interface Collaborator {
    id: string;
    avatarUrl: string;
}

export interface TripCardProps {
    name: string;
    imageUrl: string;
    lastEdited: string;
    collaborators: Collaborator[];
}

const MAX_VISIBLE_AVATARS = 2;

export default function TripCard({
    name,
    imageUrl,
    lastEdited,
    collaborators,
}: TripCardProps) {
    const visibleAvatars = collaborators.slice(0, MAX_VISIBLE_AVATARS);
    const overflowCount = collaborators.length - MAX_VISIBLE_AVATARS;

    return (
        <div className="w-full rounded-[10px] border border-[#6F78FF] bg-white overflow-hidden flex flex-col">
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
                <p className="text-[14px] font-bold text-[#4C3D79] truncate leading-tight">
                    {name}
                </p>

                <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#4C3D79]">
                        {lastEdited}
                    </span>

                    {/* Overlapping collaborator avatars */}
                    <div className="flex items-center">
                        {visibleAvatars.map((collab, i) => (
                            <img
                                key={collab.id}
                                src={collab.avatarUrl}
                                alt={`Collaborator ${i + 1}`}
                                className="size-5.75 rounded-full object-cover border-2 border-white -ml-1.75 first:ml-0"
                            />
                        ))}

                        {overflowCount > 0 && (
                            <div className="size-5.75 rounded-full bg-[#F637AF] border-2 border-white -ml-1.75 flex items-center justify-center text-white font-semibold text-[11px] shrink-0">
                                +{overflowCount}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
