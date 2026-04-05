import { useState } from 'react';
import { useCurrentUser, useUpdateUser } from '@/hooks';
import { LoadingButton, InputField, TextAreaField } from '@/components';
import { Icon } from '@iconify/react';

export function AdminProfilePage() {
  const { data: user } = useCurrentUser();
  const updateMutation = useUpdateUser();

  const [nickname, setNickname] = useState(user?.nickname || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await updateMutation.mutateAsync({
        nickname,
        avatar_url: avatarUrl,
        bio,
      });
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="card-base p-6 fade-in-up">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--klein-blue)] to-[var(--sky-blue)] flex items-center justify-center">
            <Icon icon="material-symbols:person-outline-rounded" className="text-xl text-white" />
          </div>
          <h1 className="text-90 text-xl font-bold">Profile Settings</h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card-base p-6 fade-in-up" style={{ animationDelay: '0.1s' }}>
        {error && (
          <div className="bg-red-500/10 text-red-500 rounded-[var(--radius-medium)] p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 text-green-600 rounded-[var(--radius-medium)] p-3 mb-4 text-sm">
            {success}
          </div>
        )}

        {/* Avatar Preview */}
        <div className="mb-6 text-center">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-24 h-24 rounded-full mx-auto object-cover ring-4 ring-[var(--primary)]/20 mb-2 breathing"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--klein-blue)] to-[var(--sky-blue)] mx-auto mb-2 flex items-center justify-center breathing">
              <Icon icon="material-symbols:person-outline-rounded" className="text-4xl text-white" />
            </div>
          )}
        </div>

        <InputField
          label="Nickname"
          value={nickname}
          onChange={setNickname}
          placeholder="Display name"
        />

        <InputField
          label="Avatar URL"
          value={avatarUrl}
          onChange={setAvatarUrl}
          placeholder="https://example.com/avatar.png"
          type="url"
        />

        <TextAreaField
          label="Bio"
          value={bio}
          onChange={setBio}
          placeholder="Tell us about yourself"
          rows={3}
        />

        {/* Read-only info */}
        <div className="border-t border-[var(--border-light)] pt-4 mt-4">
          <div className="text-50 text-sm space-y-1">
            <div className="flex items-center gap-2">
              <Icon icon="material-symbols:badge-outline-rounded" className="text-base" />
              Username: <span className="text-75">{user?.username}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon icon="material-symbols:mail-outline-rounded" className="text-base" />
              Email: <span className="text-75">{user?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon icon="material-symbols:shield-outline-rounded" className="text-base" />
              Role: <span className="text-75">{user?.role}</span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <LoadingButton
            type="submit"
            loading={updateMutation.isPending}
            className="bg-gradient-to-r from-[var(--klein-blue)] to-[var(--klein-blue-light)] text-white"
          >
            Save Changes
          </LoadingButton>
        </div>
      </form>
    </div>
  );
}