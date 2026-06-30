'use client';

import React, { useState } from 'react';
import { Copy, RefreshCw, LogOut, UserPlus, Users, Crown, Check, ArrowRight, Pencil, X, Info, AlertTriangle } from 'lucide-react';
import { useFamilyGroup } from '@/hooks/useFamilyGroup';
import { useToast } from '@/app/common/hooks/useToast';

export default function FamilyMembersSection() {
  const { group, isLoading, hasGroup, createGroup, joinGroup, refreshInviteCode, updateGroupName, transferOwner, leaveGroup } = useFamilyGroup();
  const { success, error: toastError } = useToast();

  const [mode, setMode] = useState<'idle' | 'create' | 'join'>('idle');
  const [groupName, setGroupName] = useState('');
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showLeaveWarningModal, setShowLeaveWarningModal] = useState(false);
  const [showJoinWarningModal, setShowJoinWarningModal] = useState(false);
  const [selectedNewOwner, setSelectedNewOwner] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');

  const handleCreate = async () => {
    if (!groupName.trim()) return;
    setIsBusy(true);
    try {
      await createGroup(groupName.trim());
      success('가족 그룹이 만들어졌습니다!');
      setMode('idle');
      setGroupName('');
    } catch {
      toastError('그룹 생성에 실패했습니다.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleJoin = async () => {
    if (!inviteCodeInput.trim()) return;
    setIsBusy(true);
    try {
      await joinGroup(inviteCodeInput.trim());
      success('가족 그룹에 참여했습니다!');
      setMode('idle');
      setInviteCodeInput('');
    } catch {
      toastError('초대 코드가 올바르지 않습니다.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleCopyCode = async () => {
    if (!group) return;
    await navigator.clipboard.writeText(group.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefreshCode = async () => {
    setIsBusy(true);
    try {
      await refreshInviteCode();
      success('초대 코드가 갱신되었습니다.');
    } catch {
      toastError('초대 코드 갱신에 실패했습니다.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleStartEditName = () => {
    setNameInput(group?.name ?? '');
    setEditingName(true);
  };

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    setIsBusy(true);
    try {
      await updateGroupName(nameInput.trim());
      success('그룹 이름이 변경되었습니다.');
      setEditingName(false);
    } catch {
      toastError('그룹 이름 변경에 실패했습니다.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleLeaveClick = () => {
    if (!group) return;
    const isOwner = group.myRole === 'OWNER';
    const hasOtherMembers = group.members.length > 1;
    if (isOwner && hasOtherMembers) {
      setSelectedNewOwner(null);
      setShowTransferModal(true);
    } else {
      setShowLeaveWarningModal(true);
    }
  };

  const handleLeaveConfirm = async () => {
    setIsBusy(true);
    try {
      await leaveGroup();
      success('개인 그룹으로 이동했습니다.');
    } catch {
      toastError('그룹 나가기에 실패했습니다.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleTransferAndLeave = async () => {
    if (!selectedNewOwner) return;
    setIsBusy(true);
    try {
      await transferOwner(selectedNewOwner);
      success('관리자 권한을 위임했습니다.');
      await leaveGroup();
      success('개인 그룹으로 이동했습니다.');
      setShowTransferModal(false);
    } catch {
      toastError('위임에 실패했습니다.');
    } finally {
      setIsBusy(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-zinc-50 border border-border/80 rounded-xl focus:bg-background focus:border-main-green focus:ring-2 focus:ring-main-green/10 text-sm font-medium text-text-main placeholder:text-text-sub/30 transition-all outline-none";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-main-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!hasGroup) {
    return (
      <div className="max-w-lg mx-auto space-y-6 py-8 animate-in fade-in duration-300">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-main-green/10 rounded-full flex items-center justify-center mx-auto">
            <Users className="w-8 h-8 text-main-green" />
          </div>
          <h3 className="text-lg font-black text-text-main">아직 가족 그룹이 없어요</h3>
          <p className="text-sm text-text-sub font-medium">그룹을 만들거나 초대 코드로 참여하세요.</p>
        </div>

        {mode === 'idle' && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMode('create')}
              className="flex flex-col items-center gap-2 p-5 bg-background border border-border/80 rounded-2xl hover:border-main-green hover:bg-main-green/5 transition-all group"
            >
              <UserPlus className="w-6 h-6 text-text-sub group-hover:text-main-green transition-colors" />
              <span className="text-sm font-black text-text-main">그룹 만들기</span>
            </button>
            <button
              onClick={() => setMode('join')}
              className="flex flex-col items-center gap-2 p-5 bg-background border border-border/80 rounded-2xl hover:border-main-green hover:bg-main-green/5 transition-all group"
            >
              <Users className="w-6 h-6 text-text-sub group-hover:text-main-green transition-colors" />
              <span className="text-sm font-black text-text-main">코드로 참여</span>
            </button>
          </div>
        )}

        {mode === 'create' && (
          <div className="bg-background border border-border/80 rounded-2xl p-6 space-y-4 animate-in fade-in">
            <h4 className="text-sm font-black text-text-main">그룹 이름 입력</h4>
            <input
              type="text"
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="예: 우리 가족"
              className={inputClass}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setMode('idle'); setGroupName(''); }}
                className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-text-sub font-bold rounded-xl text-sm transition-all"
              >취소</button>
              <button
                onClick={handleCreate}
                disabled={isBusy || !groupName.trim()}
                className="flex-1 py-2.5 bg-main-green text-white font-bold rounded-xl text-sm shadow-md shadow-main-green/20 hover:bg-main-green/90 disabled:opacity-50 transition-all"
              >{isBusy ? '생성 중...' : '만들기'}</button>
            </div>
          </div>
        )}

        {mode === 'join' && (
          <div className="bg-background border border-border/80 rounded-2xl p-6 space-y-4 animate-in fade-in">
            <h4 className="text-sm font-black text-text-main">초대 코드 입력</h4>
            <input
              type="text"
              value={inviteCodeInput}
              onChange={e => setInviteCodeInput(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              placeholder="초대 코드를 입력하세요"
              className={inputClass}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setMode('idle'); setInviteCodeInput(''); }}
                className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-text-sub font-bold rounded-xl text-sm transition-all"
              >취소</button>
              <button
                onClick={handleJoin}
                disabled={isBusy || !inviteCodeInput.trim()}
                className="flex-1 py-2.5 bg-main-green text-white font-bold rounded-xl text-sm shadow-md shadow-main-green/20 hover:bg-main-green/90 disabled:opacity-50 transition-all"
              >{isBusy ? '참여 중...' : '참여하기'}</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  const isPersonalGroup = group?.members?.length === 1;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* 그룹 개념 안내 배너 */}
      <div className="flex gap-3 p-4 bg-main-green/5 border border-main-green/20 rounded-2xl">
        <Info className="w-4 h-4 text-main-green shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          {isPersonalGroup ? (
            <>
              <p className="text-xs font-black text-main-green">현재 개인 그룹으로 이용 중이에요</p>
              <p className="text-[11px] font-medium text-text-sub leading-relaxed">
                뭉로그는 그룹이 기본 단위예요. 혼자라면 개인 그룹, 가족과 함께라면 가족 그룹으로 모든 기록을 공유해요.
                아래 초대 코드를 가족과 공유해 함께 시작해보세요!
              </p>
            </>
          ) : (
            <>
              <p className="text-xs font-black text-main-green">가족 그룹으로 이용 중이에요</p>
              <p className="text-[11px] font-medium text-text-sub leading-relaxed">
                뭉로그는 그룹이 기본 단위예요. 같은 그룹 안에서 반려동물 기록을 함께 보고 관리할 수 있어요.
              </p>
            </>
          )}
        </div>
      </div>

      {/* 초대 코드 카드 */}
      <div className="bg-background border border-border/80 rounded-2xl p-6 space-y-3">
        <div className="flex items-center justify-between gap-2">
          {editingName ? (
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                className="flex-1 px-3 py-1.5 bg-zinc-50 border border-main-green rounded-lg text-sm font-bold text-text-main outline-none focus:ring-2 focus:ring-main-green/20"
                autoFocus
              />
              <button onClick={handleSaveName} disabled={isBusy || !nameInput.trim()} className="p-1.5 bg-main-green text-white rounded-lg disabled:opacity-50">
                <Check className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setEditingName(false)} disabled={isBusy} className="p-1.5 bg-zinc-100 text-text-sub rounded-lg">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-black text-text-main">{group!.name}</h3>
              {group!.myRole === 'OWNER' && (
                <button onClick={handleStartEditName} className="p-1 text-text-sub hover:text-main-green transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
          <span className="shrink-0 text-[10px] font-bold text-text-sub bg-zinc-100 px-2 py-0.5 rounded-full">
            {group!.myRole === 'OWNER' ? '그룹 관리자' : '구성원'}
          </span>
        </div>

        <p className="text-[11px] font-medium text-text-sub">초대 코드를 공유하면 가족이 참여할 수 있어요.</p>

        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center justify-between px-4 py-3 bg-zinc-50 border border-border/60 rounded-xl">
            <span className="text-base font-black text-text-main tracking-widest">{group!.inviteCode}</span>
          </div>
          <button
            onClick={handleCopyCode}
            className="p-3 bg-main-green text-white rounded-xl hover:bg-main-green/90 transition-all active:scale-95 shadow-sm shadow-main-green/20"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
          {group!.myRole === 'OWNER' && (
            <button
              onClick={handleRefreshCode}
              disabled={isBusy}
              className="p-3 bg-zinc-100 hover:bg-zinc-200 text-text-sub rounded-xl transition-all active:scale-95 disabled:opacity-50"
              title="코드 갱신"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 구성원 목록 */}
      <div className="bg-background border border-border/80 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-black text-text-main">
          구성원 <span className="text-main-green">{group!.members.length}명</span>
        </h3>
        <div className="space-y-2">
          {group!.members.map(member => (
            <div key={member.userId} className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl border border-border/40">
              <div className="w-9 h-9 rounded-full bg-main-green/10 flex items-center justify-center shrink-0 overflow-hidden">
                {member.profileImageUrl ? (
                  <img src={member.profileImageUrl} alt={member.nickname} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-black text-main-green">{member.nickname.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text-main truncate">{member.nickname}</p>
              </div>
              {member.role === 'OWNER' && (
                <Crown className="w-4 h-4 text-amber-500 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 개인 그룹: 가족 그룹 참여 */}
      {isPersonalGroup && mode === 'idle' && (
        <button
          onClick={() => setShowJoinWarningModal(true)}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-main-green hover:bg-main-green/5 border border-main-green/40 rounded-2xl transition-all"
        >
          <Users className="w-4 h-4" />
          가족 그룹에 참여하기
        </button>
      )}

      {isPersonalGroup && mode === 'join' && (
        <div className="bg-background border border-border/80 rounded-2xl p-6 space-y-4 animate-in fade-in">
          <h4 className="text-sm font-black text-text-main">초대 코드로 가족 그룹 참여</h4>
          <input
            type="text"
            value={inviteCodeInput}
            onChange={e => setInviteCodeInput(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && handleJoin()}
            placeholder="초대 코드를 입력하세요"
            className={inputClass}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={() => { setMode('idle'); setInviteCodeInput(''); }}
              className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-text-sub font-bold rounded-xl text-sm transition-all"
            >취소</button>
            <button
              onClick={handleJoin}
              disabled={isBusy || !inviteCodeInput.trim()}
              className="flex-1 py-2.5 bg-main-green text-white font-bold rounded-xl text-sm shadow-md shadow-main-green/20 hover:bg-main-green/90 disabled:opacity-50 transition-all"
            >{isBusy ? '참여 중...' : '참여하기'}</button>
          </div>
        </div>
      )}

      {/* 그룹 나가기 */}
      <button
        onClick={handleLeaveClick}
        disabled={isBusy}
        className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-red-500 hover:bg-red-50 border border-red-200 rounded-2xl transition-all disabled:opacity-50"
      >
        <LogOut className="w-4 h-4" />
        그룹 나가기
      </button>

      {/* 소유권 위임 모달 */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !isBusy && setShowTransferModal(false)}
          />
          <div className="relative w-full sm:max-w-sm bg-background rounded-t-3xl sm:rounded-2xl p-6 space-y-5 animate-in slide-in-from-bottom-4 duration-200">
            <div className="space-y-1">
              <h3 className="text-base font-black text-text-main">관리자 위임 후 나가기</h3>
              <p className="text-xs font-medium text-text-sub">
                나가기 전에 새 관리자를 지정해주세요.
              </p>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {group!.members
                .filter(m => m.role !== 'OWNER')
                .map(member => (
                  <button
                    key={member.userId}
                    onClick={() => setSelectedNewOwner(member.userId)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      selectedNewOwner === member.userId
                        ? 'border-main-green bg-main-green/5'
                        : 'border-border/60 bg-zinc-50 hover:border-main-green/40'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-main-green/10 flex items-center justify-center shrink-0 overflow-hidden">
                      {member.profileImageUrl ? (
                        <img src={member.profileImageUrl} alt={member.nickname} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-black text-main-green">{member.nickname.charAt(0)}</span>
                      )}
                    </div>
                    <span className="flex-1 text-sm font-bold text-text-main text-left truncate">{member.nickname}</span>
                    {selectedNewOwner === member.userId && (
                      <Check className="w-4 h-4 text-main-green shrink-0" />
                    )}
                  </button>
                ))}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowTransferModal(false)}
                disabled={isBusy}
                className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 text-text-sub font-bold rounded-xl text-sm transition-all disabled:opacity-50"
              >취소</button>
              <button
                onClick={handleTransferAndLeave}
                disabled={isBusy || !selectedNewOwner}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-red-500 text-white font-bold rounded-xl text-sm hover:bg-red-600 disabled:opacity-50 transition-all"
              >
                {isBusy ? '처리 중...' : (<><ArrowRight className="w-4 h-4" />위임 후 나가기</>)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 그룹 나가기 경고 모달 */}
      {showLeaveWarningModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isBusy && setShowLeaveWarningModal(false)} />
          <div className="relative w-full sm:max-w-sm bg-background rounded-t-3xl sm:rounded-2xl p-6 space-y-5 animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="text-base font-black text-text-main">그룹 나가기 전에 확인하세요</h3>
                <p className="text-[11px] font-medium text-text-sub">탈퇴 후 개인 그룹으로 이동합니다</p>
              </div>
            </div>

            <div className="space-y-2 text-[12px] font-medium">
              <p className="text-text-sub font-bold mb-1">함께 이동하는 것</p>
              <div className="flex items-start gap-2 text-text-main">
                <Check className="w-4 h-4 text-main-green shrink-0 mt-0.5" />
                <span>내가 등록한 반려동물</span>
              </div>
              <div className="flex items-start gap-2 text-text-main">
                <Check className="w-4 h-4 text-main-green shrink-0 mt-0.5" />
                <span>내 반려동물의 케어기록·일정·증상기록</span>
              </div>
              <div className="flex items-start gap-2 text-text-main">
                <Check className="w-4 h-4 text-main-green shrink-0 mt-0.5" />
                <span>내 반려동물만 포함된 다이어리·아카이브·지도 기록</span>
              </div>

              <div className="border-t border-border/60 my-3" />

              <p className="text-text-sub font-bold mb-1">가족 그룹에 남는 것</p>
              <div className="flex items-start gap-2 text-text-sub">
                <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>가족과 함께한 기록 (여러 반려동물 포함)</span>
              </div>
              <div className="flex items-start gap-2 text-text-sub">
                <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>재고 (공동 관리 물품)</span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowLeaveWarningModal(false)}
                disabled={isBusy}
                className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 text-text-sub font-bold rounded-xl text-sm transition-all disabled:opacity-50"
              >취소</button>
              <button
                onClick={() => { setShowLeaveWarningModal(false); handleLeaveConfirm(); }}
                disabled={isBusy}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-red-500 text-white font-bold rounded-xl text-sm hover:bg-red-600 disabled:opacity-50 transition-all"
              >
                {isBusy ? '처리 중...' : (<><LogOut className="w-4 h-4" />그룹 나가기</>)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 가족 그룹 참여 경고 모달 */}
      {showJoinWarningModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isBusy && setShowJoinWarningModal(false)} />
          <div className="relative w-full sm:max-w-sm bg-background rounded-t-3xl sm:rounded-2xl p-6 space-y-5 animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="text-base font-black text-text-main">참여 전에 확인하세요</h3>
                <p className="text-[11px] font-medium text-text-sub">개인 그룹의 데이터가 가족 그룹으로 이동합니다</p>
              </div>
            </div>

            <div className="space-y-2 text-[12px] font-medium">
              <p className="text-text-sub font-bold mb-1">가족 그룹으로 함께 이동하는 것</p>
              <div className="flex items-start gap-2 text-text-main">
                <Check className="w-4 h-4 text-main-green shrink-0 mt-0.5" />
                <span>반려동물 정보</span>
              </div>
              <div className="flex items-start gap-2 text-text-main">
                <Check className="w-4 h-4 text-main-green shrink-0 mt-0.5" />
                <span>케어기록·일정·증상기록</span>
              </div>
              <div className="flex items-start gap-2 text-text-main">
                <Check className="w-4 h-4 text-main-green shrink-0 mt-0.5" />
                <span>다이어리·아카이브·지도 기록</span>
              </div>
              <div className="flex items-start gap-2 text-text-main">
                <Check className="w-4 h-4 text-main-green shrink-0 mt-0.5" />
                <span>재고·접종 정보</span>
              </div>

              <div className="border-t border-border/60 my-3" />

              <div className="flex gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  이동 후 개인 그룹은 삭제됩니다. 이 작업은 되돌릴 수 없어요.
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowJoinWarningModal(false)}
                disabled={isBusy}
                className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 text-text-sub font-bold rounded-xl text-sm transition-all disabled:opacity-50"
              >취소</button>
              <button
                onClick={() => { setShowJoinWarningModal(false); setMode('join'); }}
                disabled={isBusy}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-main-green text-white font-bold rounded-xl text-sm hover:bg-main-green/90 disabled:opacity-50 transition-all shadow-md shadow-main-green/20"
              >
                <ArrowRight className="w-4 h-4" />확인, 참여할게요
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
