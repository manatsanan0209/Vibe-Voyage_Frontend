import axios from 'axios';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, User, Pencil, X, Check, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import SuggestionCard from '@/components/tripSuggestions/SuggestionCard';
import { profileService } from '@/services/profile.service';
import { suggestionService } from '@/services/suggestion.service';
import { useI18n } from '@/hooks/useI18n';
import { STORAGE_KEYS } from '@/lib/constants';
import type { ProfileDTO } from '@/types/profile';
import type { TripSuggestionSummaryDTO } from '@/types/suggestion';

const PAGE_LIMIT = 20;

export default function Profile() {
    const navigate = useNavigate();
    const { t } = useI18n();

    // ── Profile ──────────────────────────────────────────────────────────
    const [profile, setProfile] = useState<ProfileDTO | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileError, setProfileError] = useState<string | null>(null);

    // ── Edit form ─────────────────────────────────────────────────────────
    const [isEditing, setIsEditing] = useState(false);
    const [editUsername, setEditUsername] = useState('');
    const [editFullName, setEditFullName] = useState('');
    const [editProfileImage, setEditProfileImage] = useState('');
    const [saving, setSaving] = useState(false);

    // ── Posts ─────────────────────────────────────────────────────────────
    const [posts, setPosts] = useState<TripSuggestionSummaryDTO[]>([]);
    const [postsTotal, setPostsTotal] = useState(0);
    const [postsPage, setPostsPage] = useState(1);
    const [postsLoading, setPostsLoading] = useState(true);
    const [postsError, setPostsError] = useState<string | null>(null);
    const [postsLoadingMore, setPostsLoadingMore] = useState(false);

    const [likeLoadingIds, setLikeLoadingIds] = useState<Set<number>>(new Set());
    const [bookmarkLoadingIds, setBookmarkLoadingIds] = useState<Set<number>>(new Set());

    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── Fetch profile ─────────────────────────────────────────────────────
    useEffect(() => {
        let active = true;
        setProfileLoading(true);
        setProfileError(null);

        profileService
            .getProfile()
            .then((data) => {
                if (!active) return;
                setProfile(data);
            })
            .catch((err: unknown) => {
                if (!active) return;
                if (axios.isAxiosError(err)) {
                    setProfileError(
                        err.response?.data?.error ||
                            err.response?.data?.message ||
                            t('profile.loadFailed'),
                    );
                } else {
                    setProfileError(t('profile.loadFailed'));
                }
            })
            .finally(() => {
                if (!active) return;
                setProfileLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    // ── Fetch posts ───────────────────────────────────────────────────────
    useEffect(() => {
        let active = true;
        setPostsLoading(true);
        setPostsError(null);

        profileService
            .getPosts(1, PAGE_LIMIT)
            .then((data) => {
                if (!active) return;
                setPosts(data.posts);
                setPostsTotal(data.total);
                setPostsPage(1);
            })
            .catch((err: unknown) => {
                if (!active) return;
                if (axios.isAxiosError(err)) {
                    setPostsError(
                        err.response?.data?.error ||
                            err.response?.data?.message ||
                            t('profile.postsLoadFailed'),
                    );
                } else {
                    setPostsError(t('profile.postsLoadFailed'));
                }
            })
            .finally(() => {
                if (!active) return;
                setPostsLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    // ── Edit handlers ─────────────────────────────────────────────────────
    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            setEditProfileImage(ev.target?.result as string);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    }

    function startEditing() {
        if (!profile) return;
        setEditUsername(profile.username);
        setEditFullName(profile.full_name);
        setEditProfileImage(profile.profile_image ?? '');
        setIsEditing(true);
    }

    function cancelEditing() {
        setIsEditing(false);
    }

    async function handleSave() {
        if (!profile) return;
        setSaving(true);
        try {
            const dto: { username?: string; full_name?: string; profile_image?: string } = {};
            if (editUsername !== profile.username) dto.username = editUsername;
            if (editFullName !== profile.full_name) dto.full_name = editFullName;
            if (editProfileImage !== (profile.profile_image ?? '')) dto.profile_image = editProfileImage;

            const updated = await profileService.updateProfile(dto);
            setProfile(updated);
            if (updated.username !== profile.username) {
                localStorage.setItem(STORAGE_KEYS.USERNAME, updated.username);
            }
            setIsEditing(false);
            toast.success(t('profile.updateSuccess'));
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 409) {
                    toast.error(t('profile.usernameTaken'));
                } else {
                    toast.error(
                        err.response?.data?.error ||
                            err.response?.data?.message ||
                            t('profile.updateFailed'),
                    );
                }
            } else {
                toast.error(t('profile.updateFailed'));
            }
        } finally {
            setSaving(false);
        }
    }

    // ── Load more posts ───────────────────────────────────────────────────
    async function loadMorePosts() {
        const nextPage = postsPage + 1;
        setPostsLoadingMore(true);
        try {
            const data = await profileService.getPosts(nextPage, PAGE_LIMIT);
            setPosts((prev) => [...prev, ...data.posts]);
            setPostsPage(nextPage);
        } catch {
            /* silently fail */
        } finally {
            setPostsLoadingMore(false);
        }
    }

    // ── Like / Bookmark ───────────────────────────────────────────────────
    const handleLike = useCallback(
        async (publishedTripId: number) => {
            if (likeLoadingIds.has(publishedTripId)) return;
            setLikeLoadingIds((prev) => new Set(prev).add(publishedTripId));
            try {
                const res = await suggestionService.toggleLike(publishedTripId);
                setPosts((prev) =>
                    prev.map((p) =>
                        p.published_trip_id === publishedTripId
                            ? {
                                  ...p,
                                  is_liked: res.liked,
                                  like_count: res.liked
                                      ? p.like_count + 1
                                      : p.like_count - 1,
                              }
                            : p,
                    ),
                );
            } finally {
                setLikeLoadingIds((prev) => {
                    const next = new Set(prev);
                    next.delete(publishedTripId);
                    return next;
                });
            }
        },
        [likeLoadingIds],
    );

    const handleBookmark = useCallback(
        async (publishedTripId: number) => {
            if (bookmarkLoadingIds.has(publishedTripId)) return;
            setBookmarkLoadingIds((prev) => new Set(prev).add(publishedTripId));
            try {
                const res = await suggestionService.toggleBookmark(publishedTripId);
                setPosts((prev) =>
                    prev.map((p) =>
                        p.published_trip_id === publishedTripId
                            ? { ...p, is_bookmarked: res.bookmarked }
                            : p,
                    ),
                );
            } finally {
                setBookmarkLoadingIds((prev) => {
                    const next = new Set(prev);
                    next.delete(publishedTripId);
                    return next;
                });
            }
        },
        [bookmarkLoadingIds],
    );

    const hasMorePosts = posts.length < postsTotal;

    // ── Render ────────────────────────────────────────────────────────────
    return (
        <main className="flex flex-col gap-6 sm:gap-8 px-4 sm:px-8 pb-12">
            {/* ── Profile card ──────────────────────────────────────────── */}
            <div className="w-full rounded-4xl bg-muted px-4 sm:px-8 py-6 sm:py-8">
                {profileLoading && (
                    <div className="flex items-center gap-6">
                        <Skeleton className="size-20 rounded-full shrink-0" />
                        <div className="flex flex-col gap-2 flex-1">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-40" />
                        </div>
                    </div>
                )}

                {!profileLoading && profileError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-600">
                        {profileError}
                    </div>
                )}

                {/* ── View mode ─────────────────────────────────────────── */}
                {!profileLoading && !profileError && profile && !isEditing && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        <div className="size-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                            {profile.profile_image ? (
                                <img
                                    src={profile.profile_image}
                                    alt={profile.username}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User className="size-8 text-gray-500" />
                            )}
                        </div>

                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                            <p className="text-xl font-bold text-primary truncate">
                                {profile.full_name}
                            </p>
                            <p className="text-sm text-foreground/60">@{profile.username}</p>
                            <p className="text-sm text-foreground/60">{profile.email}</p>
                        </div>

                        <Button
                            variant="outline"
                            onClick={startEditing}
                            className="self-start flex items-center gap-2"
                        >
                            <Pencil className="size-4" />
                            {t('profile.editProfile')}
                        </Button>
                    </div>
                )}

                {/* ── Edit mode ─────────────────────────────────────────── */}
                {!profileLoading && !profileError && profile && isEditing && (
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                        {/* Avatar — click to pick a photo from device */}
                        <div className="flex flex-col items-center gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={saving}
                                className="relative size-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden group disabled:opacity-60 cursor-pointer"
                            >
                                {editProfileImage ? (
                                    <img
                                        src={editProfileImage}
                                        alt={editUsername}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="size-8 text-gray-500" />
                                )}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="size-5 text-white" />
                                </div>
                            </button>
                            <span className="text-xs text-foreground/50">
                                {t('profile.changePhoto')}
                            </span>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileSelect}
                            />
                        </div>

                        {/* Form fields */}
                        <div className="flex flex-col gap-4 flex-1">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-foreground/70">
                                        {t('profile.username')}
                                    </label>
                                    <input
                                        type="text"
                                        value={editUsername}
                                        onChange={(e) => setEditUsername(e.target.value)}
                                        disabled={saving}
                                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-foreground/70">
                                        {t('profile.fullName')}
                                    </label>
                                    <input
                                        type="text"
                                        value={editFullName}
                                        onChange={(e) => setEditFullName(e.target.value)}
                                        disabled={saving}
                                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 justify-end">
                                <Button
                                    variant="ghost"
                                    onClick={cancelEditing}
                                    disabled={saving}
                                    className="flex items-center gap-2"
                                >
                                    <X className="size-4" />
                                    {t('profile.cancel')}
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-2"
                                >
                                    {saving ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        <Check className="size-4" />
                                    )}
                                    {saving ? t('profile.saving') : t('profile.save')}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── My Posts ──────────────────────────────────────────────── */}
            <div className="w-full rounded-4xl bg-muted px-4 sm:px-8 py-6 sm:py-8">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-primary">
                        {t('profile.myPosts')}
                        {!postsLoading && postsTotal > 0 && (
                            <span className="ml-2 text-lg font-medium text-foreground/50">
                                ({postsTotal})
                            </span>
                        )}
                    </h2>
                </div>

                {postsLoading && (
                    <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-64 w-full rounded-xl" />
                        ))}
                        <div className="col-span-full flex items-center justify-center gap-2 text-primary mt-2">
                            <Loader2 className="size-4 animate-spin" />
                            <span className="text-sm font-medium">{t('common.loading')}</span>
                        </div>
                    </div>
                )}

                {!postsLoading && postsError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-8 text-center text-sm text-red-600">
                        {postsError}
                    </div>
                )}

                {!postsLoading && !postsError && posts.length === 0 && (
                    <div className="rounded-lg border border-dashed border-border bg-white px-4 py-12 text-center text-sm text-primary">
                        {t('profile.noPosts')}
                    </div>
                )}

                {!postsLoading && !postsError && posts.length > 0 && (
                    <>
                        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                            {posts.map((post) => (
                                <SuggestionCard
                                    key={post.published_trip_id}
                                    trip={post}
                                    onLike={handleLike}
                                    onBookmark={handleBookmark}
                                    onClick={(_id) =>
                                        navigate(`/your-trips/${post.trip_id}`)
                                    }
                                    likeLoading={likeLoadingIds.has(
                                        post.published_trip_id,
                                    )}
                                    bookmarkLoading={bookmarkLoadingIds.has(
                                        post.published_trip_id,
                                    )}
                                />
                            ))}
                        </div>

                        {hasMorePosts && (
                            <div className="flex justify-center mt-8">
                                <button
                                    type="button"
                                    onClick={loadMorePosts}
                                    disabled={postsLoadingMore}
                                    className="flex items-center gap-2 rounded-lg border border-border bg-white px-6 py-2 text-sm font-medium text-primary hover:bg-muted transition-colors disabled:opacity-50"
                                >
                                    {postsLoadingMore && (
                                        <Loader2 className="size-4 animate-spin" />
                                    )}
                                    {postsLoadingMore ? t('common.loading') : 'Load more'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}
