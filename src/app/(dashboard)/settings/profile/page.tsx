import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/app/actions/shared';
import { ProfileForm } from './profile-form';

export default async function ProfileSettingsPage() {
  const context = await getCurrentProfile();
  if (!context) redirect('/login');

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-ice">Perfil</h1>
        <p className="mt-1 text-sm text-mist">
          Edita tu nombre y avatar. Tu rol y organización los administra tu empresa.
        </p>
      </header>

      <ProfileForm
        fullName={context.profile.full_name}
        avatarUrl={context.profile.avatar_url}
        email={context.profile.email}
        role={context.profile.role}
      />
    </div>
  );
}
