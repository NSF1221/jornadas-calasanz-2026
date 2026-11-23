import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AgendaView } from './components/AgendaView';
import { BottomNav, type AppTab } from './components/BottomNav';
import { BracketsView } from './components/BracketsView';
import { Header } from './components/Header';
import { MapView } from './components/MapView';
import { NoticesBanner } from './components/NoticesBanner';
import { OfflineIndicator } from './components/PWAInstallButton';
import { RulesTimerView } from './components/RulesTimerView';
import { TeamRosterModal } from './components/TeamRosterModal';
import { Toast, type ToastMessage } from './components/Toast';
import { useLocalStorage } from './hooks/useLocalStorage';
import type {
  MatchOutcome,
  ResolvedAgendaMatch,
  SportId,
  Team,
  UserProfile,
  ZoneId,
} from './types/tournament';
import {
  buildUserAgenda,
  profileFromSearchItem,
  searchParticipants,
  toggleMatchOutcome,
} from './utils/tournamentLogic';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('agenda');
  const [selectedSport, setSelectedSport] = useState<SportId>('baloncesto');
  const [selectedZone, setSelectedZone] = useState<ZoneId>('3');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [modalTeam, setModalTeam] = useState<Team | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const [profile, setProfile] = useLocalStorage<UserProfile | null>('calasanz26_profile', null);
  const [outcomes, setOutcomes] = useLocalStorage<Record<string, MatchOutcome>>(
    'calasanz26_outcomes',
    {}
  );
  const [includeGincana, setIncludeGincana] = useLocalStorage<boolean>(
    'calasanz26_gincana',
    false
  );

  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((text: string, tone: ToastMessage['tone'] = 'info') => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToast({ id: Date.now(), text, tone });
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
    }, 5500);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  const agenda = useMemo(
    () => buildUserAgenda(profile, outcomes, includeGincana),
    [profile, outcomes, includeGincana]
  );

  const handleSaveProfile = useCallback(
    (nextProfile: UserProfile) => {
      // Reset stored outcomes only when switching to a different profile
      if (profile && profile.id !== nextProfile.id) {
        setOutcomes({});
        setIncludeGincana(false);
      }
      setProfile(nextProfile);
      setIsEditingProfile(false);
      setActiveTab('agenda');
      showToast(`Perfil guardado en tu dispositivo: ${nextProfile.displayName}`, 'success');
    },
    [profile, setIncludeGincana, setOutcomes, setProfile, showToast]
  );

  const handleSelectOutcome = useCallback(
    (match: ResolvedAgendaMatch, outcome: MatchOutcome) => {
      const wasSame = outcomes[match.matchId] === outcome;
      setOutcomes((prev) => toggleMatchOutcome(prev, match.matchId, outcome));

      if (!wasSame && outcome === 'win') {
        showToast(
          'Guardado solo en tu móvil. Recuerda comunicar el resultado oficial a la organización o se dará por perdido a ambos.',
          'success'
        );
      } else if (!wasSame && outcome === 'loss' && match.format === 'knockout') {
        showToast(
          `Marcado como eliminado en ${match.roundName}. Se han limpiado las rondas posteriores de ${match.sportName}.`,
          'info'
        );
      }
    },
    [outcomes, setOutcomes, showToast]
  );

  const handleJumpToSport = useCallback((sportId: SportId) => {
    setSelectedSport(sportId);
    setActiveTab('brackets');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleJumpToZone = useCallback((zoneId: ZoneId) => {
    setSelectedZone(zoneId);
    setActiveTab('map');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSelectPlayerFromModal = useCallback(
    (playerName: string) => {
      const matches = searchParticipants(playerName, 5);
      const best = matches.find((m) => m.kind === 'player') ?? matches[0];
      if (best) {
        handleSaveProfile(profileFromSearchItem(best));
      }
    },
    [handleSaveProfile]
  );

  const handleSelectTeamFromModal = useCallback(
    (team: Team) => {
      handleSaveProfile({
        kind: 'team',
        id: `team:${team.id}`,
        displayName: team.name,
        sportId: team.sportId,
        teamIds: [team.id],
      });
    },
    [handleSaveProfile]
  );

  const handleHeaderProfileClick = () => {
    setActiveTab('agenda');
    if (profile) {
      setIsEditingProfile((prev) => !prev);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-dvh bg-[#F5F5DC] text-[#231712] flex flex-col">
      <OfflineIndicator />

      <Header profile={profile} onProfileClick={handleHeaderProfileClick} />

      <NoticesBanner onJumpToSport={handleJumpToSport} />

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 sm:px-6 pt-4 pb-28">
        {activeTab === 'agenda' && (
          <AgendaView
            profile={profile}
            isEditingProfile={isEditingProfile}
            onStartEditProfile={() => setIsEditingProfile(true)}
            onCancelEditProfile={() => setIsEditingProfile(false)}
            onSaveProfile={handleSaveProfile}
            matches={agenda.matches}
            overlaps={agenda.overlaps}
            sportStatuses={agenda.sportStatuses}
            includeGincana={includeGincana}
            onToggleGincana={() => setIncludeGincana((prev) => !prev)}
            onSelectOutcome={handleSelectOutcome}
            onOpenTeamModal={setModalTeam}
            onJumpToSport={handleJumpToSport}
            onJumpToZone={handleJumpToZone}
          />
        )}

        {activeTab === 'brackets' && (
          <BracketsView
            selectedSport={selectedSport}
            onSelectSport={setSelectedSport}
            userProfile={profile}
            sportStatuses={agenda.sportStatuses}
            includeGincana={includeGincana}
            onToggleGincana={() => setIncludeGincana((prev) => !prev)}
            onOpenTeamModal={setModalTeam}
            onJumpToZone={handleJumpToZone}
          />
        )}

        {activeTab === 'map' && (
          <MapView
            selectedZone={selectedZone}
            onSelectZone={setSelectedZone}
            onJumpToSport={handleJumpToSport}
          />
        )}

        {activeTab === 'rules' && <RulesTimerView initialSport={selectedSport} />}
      </main>

      <Toast toast={toast} onDismiss={() => setToast(null)} />

      <TeamRosterModal
        team={modalTeam}
        onClose={() => setModalTeam(null)}
        onSelectPlayerAsProfile={handleSelectPlayerFromModal}
        onSelectTeamAsProfile={handleSelectTeamFromModal}
      />

      <BottomNav
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'agenda') setIsEditingProfile(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        overlapCount={agenda.overlaps.length}
      />
    </div>
  );
}
